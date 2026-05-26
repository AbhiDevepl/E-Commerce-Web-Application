export class DuplicateChecker {
  private seen = new Set<string>();

  has(value: string | number): boolean {
    return this.seen.has(String(value));
  }

  mark(value: string | number): void {
    this.seen.add(String(value));
  }

  size(): number {
    return this.seen.size;
  }
}
