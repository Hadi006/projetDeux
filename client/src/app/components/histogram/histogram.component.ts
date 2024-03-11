
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit {
    chart: unknown;

    ngOnInit(): void {
        this.createChart();
    }

    createChart(): void {
        const ctx = document.getElementById('histogramChart') as HTMLCanvasElement;
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'],
                datasets: [
                    {
                        label: 'Data',
                        data: [10, 20, 30, 40, 50],
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
