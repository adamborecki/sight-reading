/** Small deterministic PRNG (mulberry32) so exercises can optionally be reproduced from a seed. */
export class Rng {
  private state: number

  constructor(seed?: number) {
    this.state = (seed ?? Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)]
  }

  /** Weighted pick; weights need not sum to 1. */
  weighted<T>(items: ReadonlyArray<{ value: T; weight: number }>): T {
    const total = items.reduce((s, i) => s + i.weight, 0)
    let r = this.next() * total
    for (const item of items) {
      r -= item.weight
      if (r <= 0) return item.value
    }
    return items[items.length - 1].value
  }
}
