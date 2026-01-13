import React from 'react';
import { AreaChart } from '@tremor/react';
import { WidgetWrapper } from './WidgetWrapper';
import { growthData } from './data';

export const NetworkGrowthWidget: React.FC = () => {
    return (
        <WidgetWrapper title="Ecosystem Growth" widgetId="growth">
            <AreaChart
                className="h-72 mt-4"
                data={growthData}
                index="date"
                categories={["Passengers", "Drivers"]}
                colors={["lime", "cyan"]}
                curveType="monotone"
                showAnimation={true}
            />
        </WidgetWrapper>
    );
};
