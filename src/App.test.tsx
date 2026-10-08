// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import type { Booking, EventType, Slot } from './api/generated'

const eventType: EventType = {
  id: 'et-1',
  title: 'Разбор проекта',
  description: 'Обсудим архитектуру и код',
  durationMinutes: 30,
  createdAt: '2026-10-01T09:00:00.000Z',
}

const takenSlot: Slot = { startAt: '2026-10-06T09:00:00.000Z', endAt: '2026-10-06T09:30:00.000Z' }
const freeSlot: Slot = { startAt: '2026-10-06T09:30:00.000Z', endAt: '2026-10-06T10:00:00.000Z' }

const booking: Booking = {
  id: 'b-1',
  eventTypeId: eventType.id,
  eventTitle: eventType.title,
  startAt: takenSlot.startAt,
  endAt: takenSlot.endAt,
  guestName: 'Анна',
  guestEmail: 'anna@example.com',
  createdAt: '2026-10-05T09:00:00.000Z',
}

let container: HTMLDivElement
let root: Root
let slotsRequests: number
let slotTaken: boolean
let conflictOnBooking: boolean

const json = (status: number, body: unknown) => ({
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => JSON.stringify(body),
})

const fetchMock = vi.fn(async (url: string, init?: { method?: string }) => {
  const path = url.replace('http://localhost:3000', '')
  if (path === '/api/v1/event-types') return json(200, [eventType])
  if (path.startsWith('/api/v1/event-types/et-1/slots')) {
    slotsRequests += 1
    return json(200, slotTaken ? [freeSlot] : [takenSlot, freeSlot])
  }
  if (path === '/api/v1/bookings' && init?.method === 'POST') {
    if (!conflictOnBooking) return json(201, booking)
    slotTaken = true
    return json(409, { code: 'SLOT_CONFLICT', message: 'Это время уже занято' })
  }
  throw new Error(`Unexpected request: ${init?.method ?? 'GET'} ${path}`)
})

const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const label = (iso: string) => timeFormatter.format(new Date(iso)).replace(/[\u00a0\u202f]/g, ' ')

const slotLabels = () =>
  [...container.querySelectorAll('.slot-grid button')].map((button) => button.textContent?.trim())

const alertText = () => container.querySelector('.error-alert')?.textContent ?? ''

const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)) })

const click = async (element: Element) => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
  await flush()
}

const submitBooking = async (guestName: string) => {
  const form = container.querySelector('form.booking-form') as HTMLFormElement
  ;(form.querySelector('input[name="name"]') as HTMLInputElement).value = guestName
  ;(form.querySelector('input[name="email"]') as HTMLInputElement).value = 'anna@example.com'
  await act(async () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
  await flush()
}

const openBooking = async () => {
  await act(async () => { root.render(<App />) })
  await flush()
  const cardAction = [...container.querySelectorAll('button')].find((button) =>
    button.textContent?.includes('Выбрать время'),
  ) as HTMLButtonElement
  await click(cardAction)
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  slotsRequests = 0
  slotTaken = false
  conflictOnBooking = false
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('scrollTo', vi.fn())
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => { root.unmount() })
  container.remove()
  vi.unstubAllGlobals()
  fetchMock.mockClear()
})

describe('booking flow', () => {
  it('shows fresh slots and releases the selection when another guest takes the time', async () => {
    conflictOnBooking = true
    await openBooking()

    expect(slotLabels()).toEqual([label(takenSlot.startAt), label(freeSlot.startAt)])

    const chosen = container.querySelector('.slot-grid button') as HTMLButtonElement
    await click(chosen)

    await submitBooking('Анна')

    expect(container.querySelector('form.booking-form')).toBeNull()
    expect(slotLabels()).toEqual([label(freeSlot.startAt)])
    expect(slotsRequests).toBe(2)
    expect(alertText()).toMatch(/заняли/i)
  })

  it('confirms the booking without extra slot requests', async () => {
    await openBooking()
    await click(container.querySelector('.slot-grid button') as HTMLButtonElement)

    await submitBooking('Иван')

    expect(container.querySelector('.success-page')?.textContent).toContain('Встреча забронирована')
    expect(slotsRequests).toBe(1)
  })
})