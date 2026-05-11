import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'

export async function getPoolEvents(params) {
    const dataEndpoint = getChainData('dataEndpoint');
    
    let { first, skip } = params || {};
    if (!first) first = 50;
    if (!skip) skip = 0;
    
    try {
        const response = await fetch(
            ${dataEndpoint}/pool-events?chain=arbitrum&limit=&skip=
        );
        const events = await response.json() || [];
        return events;
    } catch(e) {
        console.error('/pool-events GET error', e);
        return [];
    }
}