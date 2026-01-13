import React, { useState } from 'react';
import { Card, Title, Tab, TabList, TabGroup, TabPanels, TabPanel, Text, DateRangePicker, Grid, Metric, Flex, BadgeDelta, TextInput, NumberInput } from '@tremor/react';

// Types
type ConfigType = 'FIXED' | 'PERCENTAGE';

interface SignupConfig {
  enabled: boolean;
  totalFee: number;
  allocations: {
    sacco: number;
    directReferrer: number;
    indirectReferrer: number;
  };
}

interface PercentageRule {
  recipient: string;
  percentage: number;
}

interface PromotionalConfig {
  enabled: boolean;
  dateRange: { from: Date; to: Date } | undefined;
  rules: PercentageRule[];
}

export const MlmConfiguration: React.FC = () => {
  // 1. Signup Fee Config (Fixed Amount)
  const [signupConfig, setSignupConfig] = useState<SignupConfig>({
    enabled: true,
    totalFee: 1250,
    allocations: {
      sacco: 1000,
      directReferrer: 100,
      indirectReferrer: 50,
    }
  });

  // 2. Driver Earnings Config (Promotional Percentage)
  const [driverConfig, setDriverConfig] = useState<PromotionalConfig>({
    enabled: true,
    dateRange: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 30)) }, // Default 30 days
    rules: [
      { recipient: 'Driver Take Home', percentage: 80 },
      { recipient: 'Sacco', percentage: 5 },
      { recipient: 'Direct Referrer', percentage: 2 },
      { recipient: 'Indirect Referrer', percentage: 1 },
    ]
  });

  // 3. Passenger Spending Config (Promotional Percentage)
  const [passengerConfig, setPassengerConfig] = useState<PromotionalConfig>({
    enabled: true,
    dateRange: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 30)) },
    rules: [
      { recipient: 'Direct Referrer', percentage: 2 },
      { recipient: 'Indirect Referrer', percentage: 1 },
    ]
  });

  // Helpers
  const calculateSystemBalanceFixed = () => {
    const { totalFee, allocations } = signupConfig;
    return totalFee - (allocations.sacco + allocations.directReferrer + allocations.indirectReferrer);
  };

  const calculateSystemBalancePercentage = (rules: PercentageRule[]) => {
    const totalAllocated = rules.reduce((acc, rule) => acc + rule.percentage, 0);
    return Math.max(0, 100 - totalAllocated); // Ensure no negative balance
  };

  // Handlers
  const handleSignupChange = (field: keyof SignupConfig['allocations'], value: number) => {
    setSignupConfig(prev => ({
      ...prev,
      allocations: { ...prev.allocations, [field]: value }
    }));
  };

  const handlePercentageChange = (
    config: 'driver' | 'passenger',
    recipient: string,
    val: number
  ) => {
    const setter = config === 'driver' ? setDriverConfig : setPassengerConfig;
    setter(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.recipient === recipient ? { ...r, percentage: val } : r)
    }));
  };

  const handleDateChange = (config: 'driver' | 'passenger', val: any) => {
    const setter = config === 'driver' ? setDriverConfig : setPassengerConfig;
    setter(prev => ({ ...prev, dateRange: val }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Distribution Rules</h1>
        <Text className="mt-1">Configure fixed fees and percentage-based revenue sharing across the network.</Text>
      </div>

      <TabGroup>
        <TabList className="mt-4">
          <Tab>Signup Fees (Fixed)</Tab>
          <Tab>Driver Earnings (Promo)</Tab>
          <Tab>Passenger Spending (Promo)</Tab>
        </TabList>

        <TabPanels>
          {/* SIGNUP FEE PANEL */}
          <TabPanel>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <Title>Fixed Fee Allocation (KES)</Title>
                  <Text className="mb-4">Standard driver registration fee distribution.</Text>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <label className="font-semibold text-gray-700">Total Signup Fee</label>
                      <NumberInput
                        value={signupConfig.totalFee}
                        onValueChange={(v) => setSignupConfig({ ...signupConfig, totalFee: v })}
                        className="w-32"
                        min={0}
                      />
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">Sacco Allocation</label>
                        <NumberInput
                          value={signupConfig.allocations.sacco}
                          onValueChange={(v) => handleSignupChange('sacco', v)}
                          className="w-32"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">Direct Referrer</label>
                        <NumberInput
                          value={signupConfig.allocations.directReferrer}
                          onValueChange={(v) => handleSignupChange('directReferrer', v)}
                          className="w-32"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">Indirect Referrer</label>
                        <NumberInput
                          value={signupConfig.allocations.indirectReferrer}
                          onValueChange={(v) => handleSignupChange('indirectReferrer', v)}
                          className="w-32"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card decoration="top" decorationColor="blue">
                  <Title>System Balance</Title>
                  <Text>Remaining amount goes to the System.</Text>
                  <Metric className="mt-4">KES {calculateSystemBalanceFixed()}</Metric>
                  <Flex className="mt-4">
                    <Text>Total Distributed</Text>
                    <Text>KES {signupConfig.allocations.sacco + signupConfig.allocations.directReferrer + signupConfig.allocations.indirectReferrer}</Text>
                  </Flex>
                </Card>
              </div>
            </div>
          </TabPanel>

          {/* DRIVER EARNINGS PANEL */}
          <TabPanel>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <Flex className="mb-4">
                    <div>
                      <Title>Promotional Settings</Title>
                      <Text>Set active dates for this split.</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={driverConfig.enabled} onChange={() => setDriverConfig(p => ({ ...p, enabled: !p.enabled }))} className="h-5 w-5 text-blue-600 rounded" />
                      <span className="text-sm font-medium">Enabled</span>
                    </div>
                  </Flex>
                  <DateRangePicker
                    value={driverConfig.dateRange}
                    onValueChange={(v) => handleDateChange('driver', v)}
                    className="w-full"
                  />
                </Card>

                <Card>
                  <Title>Percentage Split (Total Fare)</Title>
                  <div className="mt-6 space-y-4">
                    {driverConfig.rules.map((rule) => (
                      <div key={rule.recipient} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{rule.recipient}</span>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={rule.percentage}
                            onValueChange={(v) => handlePercentageChange('driver', rule.recipient, v)}
                            className="w-24"
                            min={0} max={100}
                          />
                          <span className="text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <Card decoration="top" decorationColor={calculateSystemBalancePercentage(driverConfig.rules) < 0 ? 'red' : 'indigo'}>
                  <Title>System Balance</Title>
                  <Text>Remaining percentage.</Text>
                  <Metric className="mt-4">{calculateSystemBalancePercentage(driverConfig.rules).toFixed(1)}%</Metric>

                  <div className="mt-6">
                    <Title>Breakdown</Title>
                    <div className="mt-2 space-y-2">
                      {driverConfig.rules.map(r => (
                        <Flex key={r.recipient}>
                          <Text>{r.recipient}</Text>
                          <Text>{r.percentage}%</Text>
                        </Flex>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>

          {/* PASSENGER SPENDING PANEL */}
          <TabPanel>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <Flex className="mb-4">
                    <div>
                      <Title>Promotional Settings</Title>
                      <Text>Set active dates for passenger referral bonuses.</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={passengerConfig.enabled} onChange={() => setPassengerConfig(p => ({ ...p, enabled: !p.enabled }))} className="h-5 w-5 text-blue-600 rounded" />
                      <span className="text-sm font-medium">Enabled</span>
                    </div>
                  </Flex>
                  <DateRangePicker
                    value={passengerConfig.dateRange}
                    onValueChange={(v) => handleDateChange('passenger', v)}
                    className="w-full"
                  />
                </Card>

                <Card>
                  <Title>Referral Commissions (On Spend)</Title>
                  <div className="mt-6 space-y-4">
                    {passengerConfig.rules.map((rule) => (
                      <div key={rule.recipient} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{rule.recipient}</span>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={rule.percentage}
                            onValueChange={(v) => handlePercentageChange('passenger', rule.recipient, v)}
                            className="w-24"
                            min={0} max={100}
                          />
                          <span className="text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <Card>
                  <Title>Note</Title>
                  <Text className="mt-2">
                    These percentages are calculated based on the total trip amount paid by the passenger.
                    <br /><br />
                    Example: For a KES 1000 trip:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {passengerConfig.rules.map(r => (
                        <li key={r.recipient}>{r.recipient} gets <b>KES {(1000 * r.percentage / 100).toFixed(0)}</b></li>
                      ))}
                    </ul>
                  </Text>
                </Card>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
          Save Configuration
        </button>
      </div>
    </div>
  );
};