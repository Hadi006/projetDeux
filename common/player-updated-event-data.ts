import { Player } from '@common/player';
import { HistogramData } from '@common/histogram-data';

export interface PlayerUpdatedEventData {
    player: Player,
    histogramData: HistogramData,
};
