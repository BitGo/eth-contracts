import { methodID, rawDecode } from 'ethereumjs-abi';
import { bufferToHex } from 'ethereumjs-util';
import * as fs from 'fs';
import * as path from 'path';

import { formatValue } from './types';
import { Contract } from '../contract/contract';
import { ensure } from '../../util/ensure';
import { isValidJSON } from '../../util/json';
import { BaseDecoder } from '../../base/decoder/baseDecoder';
import { EthContractABI, } from '../../base/iface';
import { FunctionArgument, FunctionCallExplanation, MethodIdMapping} from './iface';


/**
 * A class to decode contract calls and explain their purpose
 */
export class Decoder extends BaseDecoder {
  /**
   * Read in and parse all methods from all defined contract abis
   * @return A mapping of method IDs (in hex string format) to the method ID object
   */
  protected loadMethods(): MethodIdMapping {
    const result: MethodIdMapping = {};

    for (const contractName of Contract.listContractTypes()) {
      // TODO: add ABI Dir
      const abi = fs.readFileSync(path.join( __dirname, `${Contract.ABI_DIR}/${contractName}.json`), 'utf-8');
      ensure(isValidJSON(abi), `Invalid JSON: ${abi}`);
      const jsonAbi: EthContractABI = JSON.parse(abi);

      for (const methodAbi of jsonAbi) {
        if (methodAbi.inputs) {
          const name = methodAbi.name;
          const types = methodAbi.inputs.map((input) => input.type);
          const methodIdString = bufferToHex(methodID(name, types));

          result[methodIdString] = { contractName, abi: methodAbi };
        }
      }

    }

    return result;
  }

  /** @inheritdoc */
  protected readonly methodsById: MethodIdMapping;

  /**
   * Maps 8-byte method IDs to the ABI of the method that they represent
   */

  constructor() {
    super();
  }

  /**
   * Decode the given function call data, returning a readable explanation of the call
   * @param data The data to decode
   * @return An explanation of the call, including the function name and arguments passed
   */
  public decode(data: Buffer): FunctionCallExplanation {
    const methodId = bufferToHex(data.slice(0, 4));
    const abiEncodedArguments = data.slice(4);
    ensure(this.methodsById[methodId], `Unknown method: ${methodId}`);

    const { contractName, abi: { name, inputs } } = this.methodsById[methodId];
    const types = inputs.map((input) => input.type);
    const decodedArguments = rawDecode(types, abiEncodedArguments);

    const args: FunctionArgument[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const { name, type } = inputs[i];
      const decodedArgument = decodedArguments[i];
      args.push({ name, type, value: formatValue(decodedArgument, type) });
    }

    return {
      methodId,
      name,
      args,
      contractName,
    };
  }
}