import React from 'react';
import { DonutChart } from '@tremor/react';
import { WidgetWrapper } from './WidgetWrapper';
import { acquisitionChannel } from './data';

export const AcquisitionChannelWidget: React.FC = () => {
    return (
        <WidgetWrapper title="Acquisition Channels" widgetId="acquisition">
            <DonutChart
                className="h-64 mt-4"
                data={acquisitionChannel}
                category="value"
                index="name"
                colors={["emerald", "teal", "indigo", "cyan"]}
                showAnimation={true}
            />
        </WidgetWrapper>
    );
};
