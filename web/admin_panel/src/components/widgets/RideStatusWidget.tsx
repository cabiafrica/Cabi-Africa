import React from 'react';
import { DonutChart } from '@tremor/react';
import { WidgetWrapper } from './WidgetWrapper';
import { rideStatusData } from './data';

export const RideStatusWidget: React.FC = () => {
    return (
        <WidgetWrapper title="Ride Status Distribution" widgetId="ride-status">
            <DonutChart
                className="h-72 mt-4"
                data={rideStatusData}
                category="value"
                index="name"
                colors={["cyan", "indigo", "violet"]}
                showAnimation={true}
                variant="pie"
            />
        </WidgetWrapper>
    );
};
