import { Legend, LineChart, Tab, TabGroup, TabList, TabPanel, TabPanels, Title } from '@tremor/react';
import { startOfYear, subDays } from 'date-fns';
import { useState } from 'react';

const dataFormatter = (number: number) => {
    return `${Intl.NumberFormat('us').format(number).toString()}`;
};

interface AverageBudgetUsedLineChartData {
    date: string;
    'Average Budget Used': number;
    'Your Average Budget Used': number;
}
interface AverageBudgetUsedLineChartProps {
    title: string;
    chartData: AverageBudgetUsedLineChartData[];
}

export const AverageBudgetUsedLineChartWithFilters: React.FC<AverageBudgetUsedLineChartProps> = ({ title, chartData }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('1M');

    const getDate = (dateString: string) => {
        const [month, day, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const filterData = (startDate: Date, endDate: Date) =>
        chartData.filter((item) => {
            const currentDate = getDate(item.date);
            return currentDate >= startDate && currentDate <= endDate;
        });

    const getFilteredData = (period: string) => {
        const lastAvailableDate = getDate(chartData[chartData.length - 1].date);
        switch (period) {
            case '1M': {
                const periodStartDate = subDays(lastAvailableDate, 30);
                return filterData(periodStartDate, lastAvailableDate);
            }
            case '2M': {
                const periodStartDate = subDays(lastAvailableDate, 60);
                return filterData(periodStartDate, lastAvailableDate);
            }
            case '6M': {
                const periodStartDate = subDays(lastAvailableDate, 180);
                return filterData(periodStartDate, lastAvailableDate);
            }
            case 'YTD': {
                const periodStartDate = startOfYear(lastAvailableDate);
                return filterData(periodStartDate, lastAvailableDate);
            }
            default:
                return chartData;
        }
    };
    return (
        <div className="flex flex-col justify-center items-center border border-white/16 rounded-xl py-4 mt-1.5 sm:mt-0 pr-6 mb-3 sm:mb-6">
            <Title className="pl-6">
                <span className="heading-three">{title}</span>
                <Legend
                    className="mt-2 w-full flex flex-row items-center justify-center gap-1"
                    categories={['Your Average Budget Used', 'Average Budget Used']}
                    colors={['teal', 'gray']}
                    dir="row"
                />
            </Title>
            <TabGroup defaultIndex={0} className="mt-4">
                <TabList className="pl-6" variant="line">
                    <Tab onClick={() => setSelectedPeriod('1M')}>1M</Tab>
                    <Tab onClick={() => setSelectedPeriod('2M')}>2M</Tab>
                    <Tab onClick={() => setSelectedPeriod('6M')}>6M</Tab>
                    <Tab onClick={() => setSelectedPeriod('YTD')}>YTD</Tab>
                    <Tab onClick={() => setSelectedPeriod('Max')}>Max</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <LineChart
                            className="h-72 mt-4"
                            connectNulls={true}
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            showLegend={false}
                            categories={['Your Average Budget Used', 'Average Budget Used']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <LineChart
                            className="h-72 mt-4"
                            connectNulls={true}
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            showLegend={false}
                            categories={['Your Average Budget Used', 'Average Budget Used']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <LineChart
                            className="h-72 mt-4"
                            connectNulls={true}
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            showLegend={false}
                            categories={['Your Average Budget Used', 'Average Budget Used']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <LineChart
                            className="h-72 mt-4"
                            connectNulls={true}
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            showLegend={false}
                            categories={['Your Average Budget Used', 'Average Budget Used']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <LineChart
                            className="h-72 mt-4"
                            connectNulls={true}
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            showLegend={false}
                            categories={['Your Average Budget Used', 'Average Budget Used']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};
