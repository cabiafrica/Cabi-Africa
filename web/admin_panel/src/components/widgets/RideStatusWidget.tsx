import React from 'react';
import { DonutChart, Legend, List, ListItem } from '@tremor/react';
import { WidgetWrapper } from './WidgetWrapper';
import { rideStatusData } from './data';

const currencyFormatter = (number: number) => {
    return Intl.NumberFormat('us').format(number).toString();
};

export const RideStatusWidget: React.FC = () => {
    return (
        <WidgetWrapper title="Ride Status Distribution" widgetId="ride-status">
            <div className="flex flex-col items-center justify-center">
                <DonutChart
                    className="h-60 mt-4"
                    data={rideStatusData}
                    category="value"
                    index="name"
                    colors={["emerald", "rose", "amber"]} // Using explicit colors
                    showAnimation={true}
                    valueFormatter={currencyFormatter}
                    variant="donut" // Changed to donut for better modern look
                />
                <Legend
                    className="mt-6"
                    categories={rideStatusData.map((data) => data.name)}
                    colors={["emerald", "rose", "amber"]}
                />

                {/* Custom Detail List */}
                <List className="w-full mt-6">
                    {rideStatusData.map((item) => (
                        <ListItem key={item.name}>
                            <span>{item.name}</span>
                            <span className="font-medium text-slate-900 dark:text-slate-50">
                                {item.value} ({rideStatusData.reduce((a, b) => a + b.value, 0) > 0 
                                    ? Math.round((item.value / rideStatusData.reduce((a, b) => a + b.value, 0)) * 100) 
                                    : 0}%)
                            </span>
                        </ListItem>
                    ))}
                </List>
            </div>
        </WidgetWrapper>
    );
};
