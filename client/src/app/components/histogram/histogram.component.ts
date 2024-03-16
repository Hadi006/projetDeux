import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit {
    chart: ChartConfiguration;

    constructor() {
    // this.chart = {
    //   type: 'bar',
    //   data: {
    //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //     datasets: [{
    //       label: 'Histogram',
    //       data: [12, 19, 3, 5, 2, 3],
    //     }]
    //   },
    // };
    }

    ngOnInit() {
        let newChart = new Chart('histogram', this.chart);
        newChart;
    }
}
