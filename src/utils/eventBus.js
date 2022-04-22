export default class EventBus {
  constructor() {
    this.events = {}
  }

  emit(eventName, data) {
    this.events[eventName]?.forEach((fn) => {
      fn(data)
    })
  }

  on(eventName, fn) {
    this.events[eventName] = this.events[eventName] || []
    this.events[eventName].push(fn)
  }

  off(eventName, fn) {
    this.events[eventName]?.splice(this.events[eventName].indexOf(fn), 1)
  }
}