import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges {
    @Input() chartData: ChartData;
    chart: Chart;
    private chartConfig: ChartConfiguration;

    ngOnInit() {
        this.chartConfig = {
            type: 'bar',
            data: {
                labels: [''],
                datasets: [
                    {
                        label: '',
                        data: [0],
                    },
                ],
            },
        };
        this.chart = new Chart('histogram', this.chartConfig);
    }

    ngOnChanges() {
        if (!this.chart) {
            return;
        }
        if (this.chart.data.datasets[0].label === this.chartData.datasets[0].label) {
            this.chart.data.datasets[0].data = this.chartData.datasets[0].data;
        } else {
            this.chart.data = this.chartData;
        }
        this.chart.update();
    }
}
