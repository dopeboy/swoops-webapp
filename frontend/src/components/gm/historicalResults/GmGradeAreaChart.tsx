import { AreaChart, Tab, TabGroup, TabList, TabPanel, TabPanels, Title } from '@tremor/react';
import { startOfYear, subDays } from 'date-fns';
import { useState } from 'react';

const dataFormatter = (score: number) => {
    if (score >= 0 && score <= 7) {
        return 'F';
    } else if (score >= 8 && score <= 15) {
        return 'D-';
    } else if (score >= 16 && score <= 23) {
        return 'D';
    } else if (score >= 24 && score <= 31) {
        return 'D+';
    } else if (score >= 32 && score <= 39) {
        return 'C-';
    } else if (score >= 40 && score <= 47) {
        return 'C';
    } else if (score >= 48 && score <= 55) {
        return 'C+';
    } else if (score >= 56 && score <= 63) {
        return 'B-';
    } else if (score >= 64 && score <= 71) {
        return 'B';
    } else if (score >= 72 && score <= 79) {
        return 'B+';
    } else if (score >= 80 && score <= 87) {
        return 'A-';
    } else if (score >= 88 && score <= 95) {
        return 'A';
    } else if (score >= 96 && score <= 100) {
        return 'A+';
    } else {
        return 'Invalid';
    }
};

interface GmGradeAreaChartData {
    date: string;
    'Average GM Grade': number;
    'Your GM Grade': number;
}
interface GmGradeAreaChartProps {
    title: string;
    chartData: GmGradeAreaChartData[];
}
export const GmGradeAreaChart: React.FC<GmGradeAreaChartProps> = ({ title, chartData }) => {
    return (
        <div className="border border-white/16 rounded-xl py-4 pr-6 mb-6">
            <Title className="pl-6">
                <span className="heading-three">{title}</span>
            </Title>
            <AreaChart
                className="h-72 mt-4"
                data={chartData}
                index="date"
                categories={['Your GM Grade', 'Average GM Grade']}
                colors={['teal', 'gray']}
                valueFormatter={dataFormatter}
            />
        </div>
    );
};

export const GmGradeAreaChartWithFilters: React.FC<GmGradeAreaChartProps> = ({ title, chartData }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Max');

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
        <div className="border border-white/16 rounded-xl py-4 pr-6 mb-6">
            <Title className="pl-6">
                <span className="heading-three">{title}</span>
            </Title>
            <TabGroup defaultIndex={4} className="mt-4">
                <TabList className="pl-6" variant="line">
                    <Tab color="white" onClick={() => setSelectedPeriod('1M')}>
                        1M
                    </Tab>
                    <Tab onClick={() => setSelectedPeriod('2M')}>2M</Tab>
                    <Tab onClick={() => setSelectedPeriod('6M')}>6M</Tab>
                    <Tab onClick={() => setSelectedPeriod('YTD')}>YTD</Tab>
                    <Tab onClick={() => setSelectedPeriod('Max')}>Max</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <AreaChart
                            className="h-72 mt-4"
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            categories={['Your GM Grade', 'Average GM Grade']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <AreaChart
                            className="h-72 mt-4"
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            categories={['Your GM Grade', 'Average GM Grade']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <AreaChart
                            className="h-72 mt-4"
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            categories={['Your GM Grade', 'Average GM Grade']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <AreaChart
                            className="h-72 mt-4"
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            categories={['Your GM Grade', 'Average GM Grade']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                    <TabPanel>
                        <AreaChart
                            className="h-72 mt-4"
                            data={getFilteredData(selectedPeriod)}
                            index="date"
                            categories={['Your GM Grade', 'Average GM Grade']}
                            colors={['teal', 'gray']}
                            valueFormatter={dataFormatter}
                        />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};
