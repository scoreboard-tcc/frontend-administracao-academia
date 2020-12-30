import mqtt from 'mqtt';
import { useMemo } from 'react';

const useBroker = () => {
  const broker = useMemo(() => {
    const instance = mqtt.connect(process.env.REACT_APP_BROKER_URL);

    return instance;
  }, []);

  return broker;
};

export default useBroker;
