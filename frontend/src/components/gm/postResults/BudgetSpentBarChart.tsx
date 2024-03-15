import { Title, BarChart, Legend } from '@tremor/react';

const dataFormatter = (number: number) => {
    return `${Intl.NumberFormat('us').format(number).toString()}`;
};

interface BudgetSpentBarChartData {
    budget: string;
    Lost: number;
    Won: number;
}
interface BudgetSpentBarChartProps {
    title: string;
    chartData: BudgetSpentBarChartData[];
    userBudget: number;
}
export const BugetSpentBarChart: React.FC<BudgetSpentBarChartProps> = ({ title, chartData, userBudget }) => (
    <div className="relative h-full w-full border border-white/16 rounded-xl pt-4 pb-6 pl-2 pr-6 mb-3 sm:mb-6">
        <Title className="pl-6">
            <span className="heading-three">{title}</span>
            <Legend
                className="mt-2 w-full capitalize flex flex-row items-center justify-center gap-1"
                categories={[`You spent: $${userBudget}`, 'Entries']}
                colors={['red', 'teal', 'slate']}
            />
        </Title>
        <span
            style={{ transform: 'rotate(180deg)' }}
            className="h-fit whitespace-nowrap absolute left-3 inset-y-[40%] [writing-mode:vertical-lr] subheading-three text-white"
        >
            Total Users
        </span>
        <span className="w-full absolute bottom-3 inset-x-[35%] sm:inset-x-[45%] subheading-three text-white">Budget Spent</span>
        <BarChart
            className="h-72 mt-6"
            data={chartData}
            index="budget"
            stack
            showLegend={false}
            categories={['Entries']}
            colors={['teal']}
            valueFormatter={dataFormatter}
            yAxisWidth={48}
        />
    </div>
);
