import { BaseMethodContainerMap, Method, Methods } from '../methods/methods';

/**
 * This defines the base abstraction of contracts
 */
export interface Contract<T extends Method> {
  name: string;
  instance(name?: string): Instance<T, Methods<T>>;
}

/**
 * This represents the concrete contract on the network
 */
export interface Instance<M extends Method, T extends Methods<M>> {
  name: string;
  address?: string;
  methodsHandler: T

  methods(): BaseMethodContainerMap<M>;
}

export class InstanceImpl<M extends Method, T extends Methods<M>> implements Instance<M, T> {
  name: string;
  address?: string;
  methodsHandler: T;

  constructor(name: string, methodsHandler: T, address?: string) {
    this.name = name;
    this.address = address;
    this.methodsHandler = methodsHandler;
  }

  methods(): BaseMethodContainerMap<M> {
    return this.methodsHandler.container;
  }
}