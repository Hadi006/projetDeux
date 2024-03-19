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

    ngOnInit() {
        this.chartConfig = {
            type: 'bar',
            data: this.chartData,
        };

        this.chart = new Chart('histogram', this.chartConfig);
        this.updateChart();
    }

    ngOnChanges() {
        this.updateChart();
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    }

    private updateChart() {
        if (!this.chart) {
            return;
        }

        console.log(this.chart.data);
        console.log(this.chartData);
        if (this.chart.data.datasets[0].label === this.chartData.datasets[0].label) {
            this.chart.data.datasets[0].data = this.chartData.datasets[0].data;
        } else {
            console.log('ok');
            this.chart.data = this.chartData;
        }

        Chart.getChart('histogram')?.update();
    }
}
