import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Email from '@mui/icons-material/Email';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import MuiCard from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext'
import axios from 'axios';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '550px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function VerifyEmail(props) {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);


    useEffect(() => {
        const verifyEmailToken = async () => {
            try {
                const response = await axios.post('/api/auth/verify-email', { token });
                if (response.status === 200) {
                    setSuccess(true);
                    // Update user verification status in context if logged in
                    if (user) {
                        // You'll need to implement this in your auth context
                        // updateUser({ ...user, isVerified: true });
                    }
                }
                console.log(response)
            } catch (err) {
                console.log(err)
                setError(err.response?.data?.message || 'Email verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyEmailToken();
    }, [token, user]);

    const handleResendVerification = async () => {
        setResending(true);
        setResendSuccess(false);
        setError('');
        console.log(user)

        try {
            const email = user?.user || prompt('Please enter your email address:');
            if (!email) return;


            await axios.post('/api/auth/resend-verification',  user.user );
            setResendSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };
    

    const handleNavigateToDashboard = () => {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            <SignUpContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <Grid container direction="column" alignItems="center" spacing={3}>
                        <Grid>
                            {loading ? (
                                <CircularProgress size={60} />
                            ) : success ? (
                                <CheckCircleOutline
                                    sx={{
                                        fontSize: 60,
                                        color: theme.palette.success.main
                                    }}
                                />
                            ) : (
                                <ErrorOutline
                                    sx={{
                                        fontSize: 60,
                                        // color: theme.palette.error.main
                                    }}
                                />
                            )}
                        </Grid>

                        <Grid item>
                            <Typography variant="h4" component="h1" align="center" gutterBottom>
                                {loading ? 'Verifying Email...' :
                                    success ? 'Email Verified Successfully!' :
                                        'Email Verification Failed'}
                            </Typography>
                        </Grid>

                        <Grid item>
                            <Typography variant="body1" align="center" color="textSecondary">
                                {loading ? (
                                    'Please wait while we verify your email address.'
                                ) : success ? (
                                    'Your email address has been successfully verified. You now have full access to your account.'
                                ) : (
                                    'The verification link is invalid or has expired. Please request a new verification email.'
                                )}
                            </Typography>
                        </Grid>

                        {error && (
                            <Grid item width="100%">
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            </Grid>
                        )}

                        {resendSuccess && (
                            <Grid item width="100%">
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    A new verification email has been sent. Please check your inbox.
                                </Alert>
                            </Grid>
                        )}

                        <Grid item width="100%">
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}>
                                {success ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleNavigateToDashboard}
                                        sx={{ minWidth: 200 }}
                                    >
                                        Go to Dashboard
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            onClick={handleResendVerification}
                                            disabled={resending}
                                            startIcon={<Email />}
                                            sx={{ minWidth: 200 }}
                                        >
                                            {resending ? (
                                                <>
                                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Resend Verification'
                                            )}
                                        </Button>
                                        {user && (
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/')}
                                                sx={{ minWidth: 200 }}
                                            >
                                                Back to Home
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            </SignUpContainer>
        </AppTheme>
    );
}