// Copyright 2019 Centrality Investments Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {mergeDeriveOptions} from '@cennznet/api/util/derives';
import {CennzxSpot} from '@cennznet/crml-cennzx-spot';
import {GenericAsset} from '@cennznet/crml-generic-asset';
import Alias from '@cennznet/types/alias';
import {ApiPromise} from '@plugnet/api';
import {ApiOptions as ApiOptionsBase} from '@plugnet/api/types';
import {ProviderInterface} from '@plugnet/rpc-provider/types';
import WsProvider from '@plugnet/rpc-provider/ws';
import {isFunction, isObject} from '@plugnet/util';
import * as derives from './derives';
import getPlugins from './plugins';
import {ApiOptions, IPlugin} from './types';
import {injectOption, injectPlugins} from './util/injectPlugin';
import logger from './util/logging';

const Types = require('@cennznet/types');

export class Api extends ApiPromise {
    static async create(options: ApiOptions | ProviderInterface = {}): Promise<Api> {
        const api = (await new Api(options).isReady) as Api;
        injectPlugins(api, api._plugins);
        return api;
    }

    // TODO: add other crml namespaces
    /**
     * Generic Asset CRML extention
     */
    genericAsset?: GenericAsset;
    /**
     * Cennzx Spot CRML extention
     */
    cennzxSpot?: CennzxSpot;

    protected _plugins: IPlugin[];

    constructor(provider: ApiOptions | ProviderInterface = {}) {
        const options =
            isObject(provider) && isFunction((provider as ProviderInterface).send)
                ? ({provider} as ApiOptions)
                : ({...provider} as ApiOptions);
        if (typeof options.provider === 'string') {
            options.provider = new WsProvider(options.provider);
        }

        let plugins: IPlugin[] = options.plugins || [];
        try {
            plugins = Object.values(getPlugins()).concat(plugins);
            injectOption(options, plugins);
        } catch (e) {
            logger.error('plugin loading failed');
        }

        options.types = {...Types, ...Alias, ...options.types};
        options.derives = mergeDeriveOptions(derives, options.derives);

        super(options as ApiOptionsBase);

        if (plugins) {
            this._plugins = plugins;
        }
    }
}
