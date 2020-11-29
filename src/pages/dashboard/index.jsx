import {
  Card, Col, Row, Skeleton, Statistic,
} from 'antd';
import React, { useState } from 'react';

function DashboardPage() {
//   const axios = useAxios();
  const [loading, setLoading] = useState(false);
  //   const [data, setData] = useState({});

  //   const requestData = useCallback(async () => {
  //     setLoading(true);

  //     try {
  //     //   const { data: dashboardData } = await axios.get('/dashboard');

  //       setData({});
  //     } catch (error) {
  //       message.error('Não foi possível carregar os dados.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, [axios]);

  //   useEffect(() => {
  //     requestData();
  //   }, [requestData]);

  return loading ? <Skeleton /> : (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Total de partidas"
            value={0}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Quantidade de placares"
            value={0}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default DashboardPage;
