import React, {JSX} from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import Box from "@mui/material/Box";

interface StatCardProps {
    title: string;
    value: string;
    icon: JSX.Element;
}


const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <Card style={{ margin: '20px', width: '300px' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                    <Typography variant="h5" component="h2" sx={{ marginLeft: '10px' }}>
                        {title}:
                    </Typography>
                </Box>
                <Typography variant="h5" component="p" sx={{ marginTop: '10px' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};


export default StatCard;