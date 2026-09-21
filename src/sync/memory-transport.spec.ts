import { describe, expect, it, vi } from 'vitest'

import { MemoryHub } from './memory-transport'
import type { SyncMessage } from './messages'

const stateOf = (playerId: string): SyncMessage => ({
  type: 'state',
  state: {
    playerId,
    name: playerId,
    avatar: 0,
    counters: { survivors: 30 },
    version: 1,
    updatedAt: 1,
  },
})

describe('MemoryTransport', () => {
  it('入房后双方互相触发 onPeerJoin，并能收到广播', async () => {
    const hub = new MemoryHub()
    const a = hub.createTransport('a')
    const b = hub.createTransport('b')
    const joinedAtA = vi.fn()
    const joinedAtB = vi.fn()
    const receivedAtB = vi.fn()
    a.onPeerJoin(joinedAtA)
    b.onPeerJoin(joinedAtB)
    b.onMessage(receivedAtB)

    await a.join('room')
    await b.join('room')
    expect(joinedAtA).toHaveBeenCalledWith('b')
    expect(joinedAtB).toHaveBeenCalledWith('a')
    expect(a.peers()).toEqual(['b'])

    a.send(stateOf('pa'))
    expect(receivedAtB).toHaveBeenCalledTimes(1)
    expect(receivedAtB.mock.calls[0]?.[1]).toBe('a')
  })

  it('定向发送只有目标能收到', async () => {
    const hub = new MemoryHub()
    const a = hub.createTransport('a')
    const b = hub.createTransport('b')
    const c = hub.createTransport('c')
    const atB = vi.fn()
    const atC = vi.fn()
    b.onMessage(atB)
    c.onMessage(atC)
    await Promise.all([a.join('room'), b.join('room'), c.join('room')])

    a.send(stateOf('pa'), 'b')
    expect(atB).toHaveBeenCalledTimes(1)
    expect(atC).not.toHaveBeenCalled()
  })

  it('离开房间触发 onPeerLeave，之后不再收到消息', async () => {
    const hub = new MemoryHub()
    const a = hub.createTransport('a')
    const b = hub.createTransport('b')
    const leftAtB = vi.fn()
    const atA = vi.fn()
    b.onPeerLeave(leftAtB)
    a.onMessage(atA)
    await Promise.all([a.join('room'), b.join('room')])

    await a.leave()
    expect(leftAtB).toHaveBeenCalledWith('a')
    b.send(stateOf('pb'))
    expect(atA).not.toHaveBeenCalled()
    expect(b.peers()).toEqual([])
  })

  it('消息经过序列化拷贝，接收方修改不会影响发送方', async () => {
    const hub = new MemoryHub()
    const a = hub.createTransport('a')
    const b = hub.createTransport('b')
    let received: SyncMessage | undefined
    b.onMessage((message) => {
      received = message
    })
    await Promise.all([a.join('room'), b.join('room')])
    const original = stateOf('pa')
    a.send(original)
    expect(received).toEqual(original)
    expect(received).not.toBe(original)
  })
})
