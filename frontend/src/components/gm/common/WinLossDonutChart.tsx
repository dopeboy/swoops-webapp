import { DonutChart, Legend, Text, Title } from '@tremor/react';

const dataFormatter = (amount: number) => {
    return amount.toString();
};

interface WinLossDonutChartData {
    name: string;
    winLoss: number;
}
interface WinLossDonutChartProps {
    title: string;
    chartData: WinLossDonutChartData[];
    label: string;
    result?: string;
}
export const WinLossDonutChart: React.FC<WinLossDonutChartProps> = ({ title, chartData, label, result }) => {
    return (
        <div className="h-full w-full border border-white/16 rounded-xl py-4 px-6 mb-1.5 sm:mb-6">
            <Title className="flex flex-col items-center justify-center -mb-3">
                <span className="heading-three">{title}</span>
                <Legend
                    className="mt-1 w-full flex flex-row items-center justify-center gap-1"
                    categories={[`Wins: ${chartData?.[0]?.winLoss}`, `Losses: ${chartData?.[1]?.winLoss}`]}
                    colors={['teal', 'neutral']}
                />
                {result && result?.length && <Text className="mt-0.5 font-semibold capitalize text-white">Your result: {result}</Text>}
            </Title>
            <DonutChart
                className="h-72 mt-6 donut-label"
                data={chartData}
                index="name"
                label={label}
                category="winLoss"
                colors={['teal', 'neutral']}
                valueFormatter={dataFormatter}
            />
        </div>
    );
};
