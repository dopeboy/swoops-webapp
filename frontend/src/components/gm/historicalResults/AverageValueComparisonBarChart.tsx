import { Title, BarChart } from '@tremor/react';

const dataFormatter = (number: number) => {
    return `${Intl.NumberFormat('us').format(number).toString()}`;
};

interface AverageValueComparisonBarChartData {
    value: string;
    'Other GMs': number;
    You: number;
}
interface AverageValueComparisonBarChartProps {
    title: string;
    chartData: AverageValueComparisonBarChartData[];
}
export const AverageValueComparisonBarChart: React.FC<AverageValueComparisonBarChartProps> = ({ title, chartData }) => (
    <div className="h-full w-full border border-white/16 rounded-xl py-4 pr-6 mb-6">
        <Title className="pl-6">
            <span className="heading-three">{title}</span>
        </Title>
        <BarChart
            className="h-72 mt-6"
            data={chartData}
            index="value"
            categories={['Other GMs', 'You']}
            colors={['slate', 'indigo']}
            valueFormatter={dataFormatter}
            yAxisWidth={48}
        />
    </div>
);
