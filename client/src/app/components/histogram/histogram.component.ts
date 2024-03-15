// histogram.component.ts
import { Component, Input, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit {
    @Input() chartData: { labels: string[]; data: number[] };

    chart: unknown;

    ngOnInit(): void {
        this.createChart();
    }

    createChart(): void {
        const ctx = document.getElementById('histogramChart') as HTMLCanvasElement;
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.chartData.labels,
                datasets: [
                    {
                        label: 'Data',
                        data: this.chartData.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }
}
