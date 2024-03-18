import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges, OnDestroy {
    @Input() chartData: ChartData;
    chart: Chart | undefined;
    private chartConfig: ChartConfiguration;

    constructor() {
        this.chartData = {
            labels: [],
            datasets: [
                {
                    label: '',
                    data: [],
                },
            ],
        };
    }

    ngOnInit() {
        this.chartConfig = {
            type: 'bar',
            data: this.chartData,
        };

        this.chart = new Chart('histogram', this.chartConfig);
    }

    ngOnChanges() {
        if (!Chart.getChart('histogram')) {
            this.chart = new Chart('histogram', this.chartConfig);
            return;
        }
        if (!this.chart) {
            return;
        }

        if (this.chart.data.datasets[0].label === this.chartData.datasets[0].label) {
            this.chart.data.datasets[0].data = this.chartData.datasets[0].data;
        } else {
            this.chart.data = this.chartData;
        }
        Chart.getChart('histogram')?.update();
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    }
}
