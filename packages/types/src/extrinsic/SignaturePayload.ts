// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* tslint:disable no-magic-numbers */

import FeeExchange, {OptionalFeeExchange} from '@cennznet/types/extrinsic/FeeExchange';
import {KeyringPair} from '@plugnet/keyring/types';
import {AnyNumber, AnyU8a} from '@plugnet/types/types';

import {blake2AsU8a} from '@plugnet/util-crypto';

import {ExtrinsicEra, Hash, Method, Option, RuntimeVersion, Struct} from '@plugnet/types';
import Nonce from '@plugnet/types/type/NonceCompact';
import {u8aConcat} from '@plugnet/util';
import {Doughnut, OptionalDoughnut} from './Doughnut';

type SignaturePayloadValue = {
    nonce?: AnyNumber;
    method?: Method;
    era?: AnyU8a | ExtrinsicEra;
    blockHash?: AnyU8a;
    doughnut?: Option<Doughnut>;
    feeExchange?: Option<FeeExchange>;
};

/**
 * @name SignaturePayload
 * @description
 * A signing payload for an [[Extrinsic]]. For the final encoding, it is variable length based
 * on the conetnts included
 *
 *   8 bytes: The Transaction Index/Nonce as provided in the transaction itself.
 *   2+ bytes: The Function Descriptor as provided in the transaction itself.
 *   2 bytes: The Transaction Era as provided in the transaction itself.
 *   32 bytes: The hash of the authoring block implied by the Transaction Era and the current block.
 */
export default class SignaturePayload extends Struct {
    protected _signature?: Uint8Array;

    constructor(value?: SignaturePayloadValue | Uint8Array) {
        super(
            {
                nonce: Nonce,
                method: Method,
                era: ExtrinsicEra,
                blockHash: Hash,
                doughnut: OptionalDoughnut,
                feeExchange: OptionalFeeExchange,
            },
            value
        );
    }

    /**
     * @description `true` if the payload refers to a valid signature
     */
    get isSigned(): boolean {
        return !!(this._signature && this._signature.length === 64);
    }

    /**
     * @description The block [[Hash]] the signature applies to (mortal/immortal)
     */
    get blockHash(): Hash {
        return this.get('blockHash') as Hash;
    }

    /**
     * @description The [[Method]] contained in the payload
     */
    get method(): Method {
        return this.get('method') as Method;
    }

    /**
     * @description The [[ExtrinsicEra]]
     */
    get era(): ExtrinsicEra {
        return this.get('era') as ExtrinsicEra;
    }

    /**
     * @description The [[Nonce]]
     */
    get nonce(): Nonce {
        return this.get('nonce') as Nonce;
    }

    /**
     * @description The raw signature as a `Uint8Array`
     */
    get signature(): Uint8Array {
        if (!this.isSigned) {
            throw new Error('Transaction is not signed');
        }

        return this._signature as Uint8Array;
    }

    get doughnut(): Option<Doughnut> {
        return this.get('doughnut') as Option<Doughnut>;
    }

    get feeExchange(): Option<FeeExchange> {
        return this.get('feeExchange') as Option<FeeExchange>;
    }

    toU8a(isBare?: boolean): Uint8Array {
        const values = this.toArray();
        return u8aConcat(...values.map(entry => entry.toU8a(true)));
    }

    /**
     * @description Sign the payload with the keypair
     */
    sign(signerPair: KeyringPair, version?: RuntimeVersion): Uint8Array {
        // for newer api versions, hash when length > 256
        const isLegacy =
            !version ||
            (version.specName.eq('node') && version.specVersion.ltn(18)) ||
            (version.specName.eq('polkadot') && version.specVersion.ltn(107));
        const u8a = this.toU8a();
        const encoded = !isLegacy && u8a.length > 256 ? blake2AsU8a(u8a) : u8a;

        this._signature = signerPair.sign(encoded);

        return this._signature;
    }
}