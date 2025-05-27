import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { Link as RouterLink } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

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

export default function SignUp(props) {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [firstNameError, setFirstNameError] = React.useState(false);
    const [firstNameErrorMessage, setFirstNameErrorMessage] = React.useState('');
    const [lastNameError, setLastNameError] = React.useState(false);
    const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');
    const [usernameError, setUsernameError] = React.useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
    const [passwordConfirmationError, setPasswordConfirmationError] = React.useState(false);
    const [passwordConfirmationErrorMessage, setPasswordConfirmationErrorMessage] = React.useState('');
    const {register, error, isLoading} = useRegister()

    const validateInputs = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const passwordConfirmation = document.getElementById('password_confirmation');
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const username = document.getElementById('username');

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('The email must be a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('The password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (password.value && passwordConfirmation.value !== password.value) {
            setPasswordConfirmationError(true);
            setPasswordConfirmationErrorMessage('The password confirmation does not match.');
            isValid = false;
        } else {
            setPasswordConfirmationError(false);
            setPasswordConfirmationErrorMessage('');
        }

        if (!firstName.value || firstName.value.length < 1) {
            setFirstNameError(true);
            setFirstNameErrorMessage('The first name field is required.');
            isValid = false;
        } else {
            setFirstNameError(false);
            setFirstNameErrorMessage('');
        }

        if (!lastName.value || lastName.value.length < 1) {
            setLastNameError(true);
            setLastNameErrorMessage('The last name field is required.');
            isValid = false;
        } else {
            setLastNameError(false);
            setLastNameErrorMessage('');
        }

        if (!username.value || username.value.length < 1) {
            setUsernameError(true);
            setUsernameErrorMessage('The username field is required.');
            isValid = false;
        } else {
            setUsernameError(false);
            setUsernameErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (firstNameError || usernameError || emailError || passwordError || passwordConfirmationError) {
            return;
        }

        const data = new FormData(event.currentTarget);
        
        const formData =  {
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            username: data.get('username'),
            email: data.get('email'),
            password: data.get('password'),
        };

        await register(formData.firstName, formData.lastName, formData.username, formData.email, formData.password);
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            <SignUpContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <Grid                        
                        sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center"
                        }}
                    >
                        <img src='/assets/images/logo.png' width={'80%'} loading="lazy" />
                    </Grid>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: '100%', fontSize: 'clamp(1.5rem, 10vw, 1.15rem)', textAlign: 'center' }}
                    >
                        Sign up
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        // sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6  }}>
                                <FormControl
                                    fullWidth
                                >
                                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                                    <TextField
                                        autoComplete="firstName"
                                        name="firstName"
                                        required
                                        fullWidth
                                        id="firstName"
                                        placeholder="Jon"
                                        error={firstNameError}
                                        helperText={firstNameErrorMessage}
                                        color={firstNameError ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6  }}>
                                <FormControl
                                    fullWidth
                                >
                                    <FormLabel htmlFor="lastName">Last name</FormLabel>
                                    <TextField
                                        autoComplete="lastName"
                                        name="lastName"
                                        required
                                        fullWidth
                                        id="lastName"
                                        placeholder="Snow"
                                        error={lastNameError}
                                        helperText={lastNameErrorMessage}
                                        color={lastNameError ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6  }}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor="name">Username</FormLabel>
                                    <TextField
                                        autoComplete="username"
                                        name="username"
                                        required
                                        fullWidth
                                        id="username"
                                        placeholder=""                                
                                        error={usernameError}
                                        helperText={usernameErrorMessage}
                                        color={usernameError ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6  }}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor="email">Email</FormLabel>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        placeholder="your@email.com"
                                        name="email"
                                        autoComplete="email"
                                        variant="outlined"
                                        error={emailError}
                                        helperText={emailErrorMessage}
                                        color={passwordError ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6  }}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor="password">Password</FormLabel>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        placeholder="••••••"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        variant="outlined"
                                        error={passwordError}
                                        helperText={passwordErrorMessage}
                                        color={passwordError ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6  }}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor="password">Password Confirmation</FormLabel>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password_confirmation"
                                        placeholder="••••••"
                                        type="password"
                                        id="password_confirmation"
                                        autoComplete="new-password_confirmation"
                                        variant="outlined"
                                        error={passwordConfirmationError}
                                        helperText={passwordConfirmationErrorMessage}
                                        color={passwordConfirmationError ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            // variant="contained outlined"
                            loading={isLoading} 
                            variant="outlined" 
                            loadingPosition="start"
                            onClick={validateInputs}
                            style={{ marginTop: '30px' }}
                        >
                            Sign up
                        </Button>
                    </Box>
                    <Divider>
                        <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                    </Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ textAlign: 'center' }}>
                            Already have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/login"
                                variant="body2"
                                sx={{ alignSelf: 'center' }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignUpContainer>
        </AppTheme>
    );
}
