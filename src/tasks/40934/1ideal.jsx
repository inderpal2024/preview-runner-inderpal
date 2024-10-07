import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { format, set, differenceInSeconds, addSeconds } from 'date-fns';

function App() {
  const [is24Hour, setIs24Hour] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [newAlarm, setNewAlarm] = useState({ addingAlarm: false, time: '', isPM: false });
  const [stopwatch, setStopwatch] = useState({ running: false, startTime: null, currentTime: 0, splits: [] });
  const [alarmActive, setAlarmActive] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTime(new Date());
      if (stopwatch.running) {
        setStopwatch(prev => ({ ...prev, currentTime: prev.startTime ? Date.now() - prev.startTime : 0 }));
      }
      checkAlarms();
    }, 1000);

    return () => clearTimeout(timer);
  }, [stopwatch.running, time]);

  useEffect(() => {
    let timeout;
    if (alarmActive >= 0) {
      timeout = setTimeout(() => setAlarmActive(alarmActive - 1), 500);
    }
    return () => clearTimeout(timeout);
  }, [alarmActive]);

  const checkAlarms = () => {
    const now = new Date();
    const currSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    alarms.forEach(alarm => {
      if ((parseInt(Math.abs(alarm.time / 1000 - currSeconds)) <= 0) && alarm.active) {
        setAlarmActive(10);
      }
    });
  };

  const addAlarm = () => {
    if (newAlarm.time) {
      let [hour, minute, seconds] = newAlarm.time.split(':').map(Number).map(val => val || 0);
      if (!is24Hour) {
        if (newAlarm.isPM) {
          hour += 12;
        } else if (hour == 12) {
          hour = 0;
        }
      }

      if (hour < 24 && minute < 60 && seconds < 60) {
        const alarm = {
          time: (hour * 3600 + minute * 60 + seconds) * 1000,
          active: true 
        };
        setAlarms(prev => {
          let index = prev.findIndex(prevAlarm => prevAlarm.time === alarm.time);
          if (index === -1) {
            return [...prev, alarm].sort((a, b) => a.time - b.time);
          } else if (prev[index].active) {
            return prev;
          } else {
            prev[index].active = true;
            return [...prev];
          }
        });
      }
    }
    setNewAlarm({ addingAlarm: false, time: '', isPM: false });
  };

  const toggleAlarm = (index) => {
    setAlarms(prev => prev.map((alarm, i) => i === index ? { ...alarm, active: !alarm.active } : alarm));
  };

  const handleStopwatch = (action) => {
    switch(action) {
      case 'start':
        setStopwatch({ running: true, startTime: Date.now(), currentTime: 0, splits: [] });
        break;
      case 'stop':
        setStopwatch({ running: false, startTime: null, currentTime: 0, splits: [] });
        break;
      case 'pause':
        setStopwatch(prev => ({ ...prev, running: false, currentTime: Date.now() - prev.startTime }));
        break;
      case 'resume':
        setStopwatch(prev => ({ ...prev, running: true, startTime: Date.now() - prev.currentTime }));
        break;
      case 'split':
        setStopwatch(prev => ({ ...prev, splits: [...prev.splits, prev.currentTime] }));
        break;
    }
  };
  const formatTimeFromMilliSec = (time, to12Hrs=false) => {
    let hours, minutes, seconds = parseInt(time / 1000);
    hours = (parseInt(seconds / 3600) + '').padStart(2, '0');
    seconds = seconds % 3600;
    minutes = (parseInt(seconds / 60) + '').padStart(2, '0');
    seconds = ((seconds % 60) + '').padStart(2, '0');

    if (to12Hrs) {
      return `${hours % 12 || 12}:${minutes}:${seconds} ${hours > 12 ? 'PM' : 'AM'}`;
    } else {
      return `${hours}:${minutes}:${seconds}`;
    }
  }

  return (
    <div className="bg-blue-50 min-h-screen flex flex-col items-center h-screen p-4 sm:p-8">
      <Tabs defaultValue="watch" className={"h-full w-full lg:w-1/2 md:w-3/4 sm:w-5/6 rounded-lg " +
            " flex flex-col items-stretch justify-between border bg-white"}>
        <TabsContent value="watch" className="w-full mt-0 max-h-[calc(100%-40px)]">
          <Card className="w-full bg-blue-100 max-h-[100%] flex flex-col no-wrap">
            <CardHeader className="shrink-0 grow-0">
              <CardTitle className={"mb-4 w-full text-center text-3xl font-mono p-8 mx-auto rounded-lg shadow-[0px_0px_4px_0] "
                  + ((alarmActive > 0) && (alarmActive % 2 == 0) ? "text-green-400" :"")}
                >
                {format(time, is24Hour ? 'HH:mm:ss' : 'hh:mm:ss a')}
              </CardTitle>

              <div className="flex justify-center space-x-2 items-center">
                {newAlarm.addingAlarm && (
                  <>
                  <Input 
                    type="text"
                    placeholder="HH:MM:SS"
                    className="flex-none w-fit"
                    value={newAlarm.time} 
                    onChange={(e) => setNewAlarm({...newAlarm, time: e.target.value})} 
                  />
                  {!is24Hour && (
                    <select onChange={(e) => setNewAlarm({...newAlarm, isPM: e.target.value === 'PM'})}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  )}
                  </>
                )}
                <Button
                    onClick={() => (newAlarm.addingAlarm ? addAlarm() : setNewAlarm({addingAlarm: true, time: '', isPM: false}))}
                  >
                  {newAlarm.addingAlarm ? "Add" : "Add Alarm"}
                </Button>
              </div>
            </CardHeader>

            {alarms.length ? <CardContent className="p-4 bg-white rounded grow shrink overflow-auto">
              <div className="overflow-y-auto">
                {alarms.map((alarm, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span>{formatTimeFromMilliSec(alarm.time, !is24Hour)}</span>
                    <Switch
                      checked={alarm.active}
                      className={"shadow-md data-[state=checked]:bg-green-400 "
                          + (alarm.active ? "shadow-green-300" : "shadow-gray-300")}
                      onCheckedChange={() => toggleAlarm(index)}
                      >
                    </Switch>
                  </div>
                ))}
              </div>
            </CardContent> : ''}
          </Card>
        </TabsContent>
        <TabsContent value="stopwatch" className="mt-0 max-h-[calc(100%-40px)]">
          <Card className="w-full bg-blue-100  max-h-[100%] flex flex-col no-wrap">
            <CardHeader className="shrink-0 grow-0">
              <CardTitle className="mb-4 w-full text-center text-3xl font-mono p-8 mx-auto rounded-lg shadow-[0px_0px_4px_0]">
                {formatTimeFromMilliSec(stopwatch.currentTime)}
              </CardTitle>

              <div className="flex justify-center space-x-2 items-center">
                <Button onClick={() => handleStopwatch(stopwatch.startTime ? 'stop': 'start')}>
                  {stopwatch.startTime ? 'Stop': 'Start'}
                </Button>
                {stopwatch.startTime && (
                  <>
                    <Button onClick={() => handleStopwatch(stopwatch.running ? 'pause' : 'resume')}>
                      {stopwatch.running ? 'Pause' : 'Resume'}
                    </Button>
                    <Button onClick={() => handleStopwatch('split')}>Split</Button>
                  </>
                )}
              </div>
            </CardHeader>

            {stopwatch.splits.length ? <CardContent className="p-4 bg-white rounded grow shrink overflow-auto">
              <ol className="list-decimal pl-5">
                {stopwatch.splits.map((split, idx) => (
                  <li key={idx}>{formatTimeFromMilliSec(split)}</li>
                ))}
              </ol>
            </CardContent> : ''}
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-0 max-h-[calc(100%-40px)]">
          <Card className="w-full bg-blue-100">
            <CardHeader className="shrink-0 grow-0">
              <CardTitle className="mb-4 text-center text-2xl font-mono text-shadow-md">
              Settings
              </CardTitle>
            </CardHeader>

            <CardContent className="flex items-center justify-start p-4 bg-white overflow-auto">
              24 Hour Format
              <Switch 
                  checked={is24Hour} 
                  onCheckedChange={setIs24Hour} 
                  className={"ml-4 shadow-md data-[state=checked]:bg-green-400 "
                      + (is24Hour ? "shadow-green-300" : "shadow-gray-300")}
                >
              </Switch>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsList className="h-[40px] bg-blue-200">
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default App;