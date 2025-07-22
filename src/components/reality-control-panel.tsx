'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Globe2, 
  Cpu, 
  Wifi, 
  Settings, 
  Play, 
  Pause, 
  Square,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  Satellite,
  Radio,
  Smartphone,
  Monitor,
  Car,
  Home,
  Building,
  Factory,
  Wrench,
  Target,
  MapPin,
  Clock,
  Gauge
} from 'lucide-react';

interface DeviceControl {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  last_command: string;
  response_time: number;
  success_rate: number;
}

const mockDevices: DeviceControl[] = [
  {
    id: 'dev_001',
    name: 'Smart Building Controller',
    type: 'building_automation',
    status: 'online',
    location: 'New York, USA',
    last_command: 'Optimize lighting schedule',
    response_time: 0.3,
    success_rate: 99.2
  },
  {
    id: 'dev_002', 
    name: 'Industrial Robot Arm',
    type: 'robotics',
    status: 'online',
    location: 'Detroit, USA',
    last_command: 'Precision assembly task',
    response_time: 0.1,
    success_rate: 98.7
  },
  {
    id: 'dev_003',
    name: 'Smart Grid Controller',
    type: 'energy',
    status: 'maintenance',
    location: 'Berlin, Germany',
    last_command: 'Load balancing',
    response_time: 1.2,
    success_rate: 97.5
  },
  {
    id: 'dev_004',
    name: 'Autonomous Vehicle Fleet',
    type: 'transportation',
    status: 'online',
    location: 'Tokyo, Japan',
    last_command: 'Route optimization',
    response_time: 0.5,
    success_rate: 99.8
  },
  {
    id: 'dev_005',
    name: 'Healthcare Monitor Network',
    type: 'healthcare',
    status: 'online',
    location: 'London, UK',
    last_command: 'Patient vitals sync',
    response_time: 0.2,
    success_rate: 99.9
  }
];

export function RealityControlPanel() {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [commandType, setCommandType] = useState<string>('');
  const [commandParameters, setCommandParameters] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);

  const executeRealityCommand = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch('/api/reality-fabricator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: commandType,
          deviceId: selectedDevice,
          parameters: {
            deviceType: mockDevices.find(d => d.id === selectedDevice)?.type,
            location: mockDevices.find(d => d.id === selectedDevice)?.location,
            scope: 'targeted',
            commandParameters
          }
        })
      });
      
      const data = await response.json();
      setExecutionResults(data);
    } catch (error) {
      console.error('Reality fabrication failed:', error);
    }
    setIsExecuting(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'building_automation': return Building;
      case 'robotics': return Wrench;
      case 'energy': return Zap;
      case 'transportation': return Car;
      case 'healthcare': return Monitor;
      default: return Cpu;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'offline': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'maintenance': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-500">
          <Zap className="h-6 w-6" />
          Reality Control Panel
        </CardTitle>
        <CardDescription>
          Control physical and digital reality through IoT and robotics integration
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="monitoring">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {mockDevices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.type);
                return (
                  <Card key={device.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <DeviceIcon className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{device.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {device.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(device.status)}>
                          {device.status}
                        </Badge>
                        <div className="text-right text-sm">
                          <div className="text-green-500">{device.success_rate}%</div>
                          <div className="text-muted-foreground">{device.response_time}s</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Last: {device.last_command}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="device-select">Target Device</Label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device to control" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} - {device.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="command-type">Command Type</Label>
                  <Select value={commandType} onValueChange={setCommandType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select command type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimize_performance">Optimize Performance</SelectItem>
                      <SelectItem value="schedule_maintenance">Schedule Maintenance</SelectItem>
                      <SelectItem value="emergency_stop">Emergency Stop</SelectItem>
                      <SelectItem value="status_report">Status Report</SelectItem>
                      <SelectItem value="firmware_update">Firmware Update</SelectItem>
                      <SelectItem value="configuration_sync">Configuration Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parameters">Command Parameters</Label>
                  <Input
                    id="parameters"
                    placeholder="Enter command parameters (JSON format)"
                    value={commandParameters}
                    onChange={(e) => setCommandParameters(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Reality Fabrication Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Reality Coherence</span>
                      <span className="text-green-500">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline Integrity</span>
                      <span className="text-green-500">Stable</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantum Entanglement</span>
                      <span className="text-blue-500">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Causality Protection</span>
                      <span className="text-green-500">Enabled</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={executeRealityCommand}
                  disabled={!selectedDevice || !commandType || isExecuting}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {isExecuting ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Fabricating Reality...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Reality Command
                    </>
                  )}
                </Button>
              </div>
            </div>

            {executionResults && (
              <Card className="p-4 bg-green-500/10 border-green-500/20">
                <h4 className="font-semibold text-green-500 mb-2">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Reality Command Executed Successfully
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Miracle ID:</strong> {executionResults.miracle?.miracle_id}
                  </div>
                  <div>
                    <strong>Execution Time:</strong> {executionResults.miracle?.miracle_metrics?.execution_time_ms}ms
                  </div>
                  <div>
                    <strong>Reality Status:</strong> {executionResults.reality_status}
                  </div>
                  <div>
                    <strong>Devices Affected:</strong> {executionResults.miracle?.global_impact?.devices_affected}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe2 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Global Coverage</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">94.7%</div>
                <div className="text-xs text-muted-foreground">Connected regions</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Response Time</span>
                </div>
                <div className="text-2xl font-bold text-green-500">0.3s</div>
                <div className="text-xs text-muted-foreground">Average latency</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-orange-500">98.9%</div>
                <div className="text-xs text-muted-foreground">Command execution</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Energy Usage</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">2.4kW</div>
                <div className="text-xs text-muted-foreground">Current draw</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Device Type Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Smart Buildings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-16 h-2" />
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Transportation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="w-16 h-2" />
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Industrial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={20} className="w-16 h-2" />
                      <span className="text-sm">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Healthcare</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={10} className="w-16 h-2" />
                      <span className="text-sm">10%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4">Recent Reality Modifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <div className="font-medium text-sm">Optimized traffic flow</div>
                      <div className="text-xs text-muted-foreground">Tokyo, Japan</div>
                    </div>
                    <Badge variant="outline" className="text-green-500">Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <div className="font-medium text-sm">Energy grid rebalance</div>
                      <div className="text-xs text-muted-foreground">Berlin, Germany</div>
                    </div>
                    <Badge variant="outline" className="text-green-500">Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <div className="font-medium text-sm">Building climate sync</div>
                      <div className="text-xs text-muted-foreground">New York, USA</div>
                    </div>
                    <Badge variant="outline" className="text-green-500">Success</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}