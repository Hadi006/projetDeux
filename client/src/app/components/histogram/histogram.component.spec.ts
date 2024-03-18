import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Chart } from 'chart.js';

import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HistogramComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.chart).toBeDefined();
    });

    it('should update chart', () => {
        if (!component.chart) {
            fail('Chart is not defined');
            return;
        }
        const chartData = {
            labels: [''],
            datasets: [
                {
                    label: '',
                    data: [0],
                },
            ],
        };
        spyOn(component.chart, 'update');
        component.chartData = chartData;
        component.ngOnChanges();
        expect(component.chart.data.datasets[0].data).toEqual(chartData.datasets[0].data);
        expect(component.chart.update).toHaveBeenCalled();
    });

    it('should update chart with different label', () => {
        if (!component.chart) {
            fail('Chart is not defined');
            return;
        }
        const chartData = {
            labels: [''],
            datasets: [
                {
                    label: 'Different label',
                    data: [0],
                },
            ],
        };
        spyOn(component.chart, 'update');
        component.chartData = chartData;
        component.ngOnChanges();
        expect(component.chart.data).toEqual(chartData);
        expect(component.chart.update).toHaveBeenCalled();
    });

    it('should not update chart', () => {
        if (!component.chart) {
            fail('Chart is not defined');
            return;
        }
        spyOn(Chart.prototype, 'update');
        component.chart = undefined;
        component.ngOnChanges();
        expect(Chart.prototype.update).not.toHaveBeenCalled();
    });

    it('should assign a new chart', () => {
        if (!component.chart) {
            fail('Chart is not defined');
            return;
        }
        component.chart.destroy();
        spyOn(Chart, 'getChart').and.returnValue(undefined);
        component.ngOnChanges();
        expect(Chart.getChart).toHaveBeenCalled();
        expect(component.chart).toBeDefined();
    });
});
