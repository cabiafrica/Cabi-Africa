import React from 'react';
import { AreaChart } from '@tremor/react';
import { WidgetWrapper } from './WidgetWrapper';
import { revenueData } from './data';

export const RevenueWidget: React.FC = () => {
    return (
        <WidgetWrapper title="Weekly Revenue Trend" widgetId="revenue">
            <AreaChart
                className="h-72 mt-4"
                data={revenueData}
                index="date"
                categories={["Revenue", "Commission"]}
                colors={["blue", "amber"]}
                valueFormatter={(number) => `KES ${Intl.NumberFormat('us').format(number).toString()}`}
                curveType="natural"
                showAnimation={true}
            />
        </WidgetWrapper>
    );
};
