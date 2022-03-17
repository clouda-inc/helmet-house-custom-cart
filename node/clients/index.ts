import { IOClients } from '@vtex/api'

import Status from './status'
import OMS from './orders'
import HelmetHouse from './helmetHouseCRM'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }

  public get orders() {
    return this.getOrSet('orders', OMS)
  }

  public get helmetHouseCRM() {
    return this.getOrSet('helmetHouseCRM', HelmetHouse)
  }
}
