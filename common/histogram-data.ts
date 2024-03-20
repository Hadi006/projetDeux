interface HistogramData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
    }[];
}

export { HistogramData };
