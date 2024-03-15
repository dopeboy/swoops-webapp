import { Legend, LineChart, Title } from '@tremor/react';

const dataFormatter = (score: number) => {
    return score > 0 ? `${score}` : `${score}`;
};
interface PointDifferentialLineChartData {
    pointDifference: number;
    'Total Users': number;
}
interface PointDifferentialLineChartProps {
    title: string;
    chartData: PointDifferentialLineChartData[];
    userPointDifferential: number;
}
export const PointDifferentialLineChart: React.FC<PointDifferentialLineChartProps> = ({ title, chartData, userPointDifferential }) => {
    return (
        <div className="relative h-full border border-white/16 rounded-xl pt-4 pb-7 pr-6 mb-3">
            <Title className="pl-6">
                <span className="heading-three">{title}</span>
                <Legend
                    className="mt-2 w-full capitalize flex flex-row items-center justify-center gap-1"
                    categories={[
                        `Your differential: ${userPointDifferential > 0 ? `+${userPointDifferential}` : userPointDifferential}`,
                        'Total Users',
                    ]}
                    colors={['indigo', 'rose']}
                    dir="row"
                />
            </Title>
            <span
                style={{ transform: 'rotate(180deg)' }}
                className="h-fit whitespace-nowrap absolute left-3 inset-y-[40%] [writing-mode:vertical-lr] subheading-three text-white"
            >
                Total Users
            </span>
            <span className="w-full absolute bottom-3 inset-x-[33%] sm:inset-x-[45%] subheading-three text-white">Point Differential</span>
            <LineChart
                className="h-72 mt-4"
                data={chartData}
                index="pointDifference"
                showLegend={false}
                categories={[`Your point differential was ${userPointDifferential}`, 'Total Users']}
                colors={['indigo', 'rose']}
                valueFormatter={dataFormatter}
            />
        </div>
    );
};
