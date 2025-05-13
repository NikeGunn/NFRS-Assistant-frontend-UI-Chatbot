import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { FiAtSign, FiLock, FiEye, FiEyeOff, FiMail, FiCheck, FiBook, FiHelpCircle, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import IconWrapper from '../../components/IconWrapper';
import { RegisterRequest } from '../../types/api.types';

// OpenAI-inspired styled components with perfect vertical alignment
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #fafafa;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
`;

const BrandingContainer = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #10A37F 0%, #0c8a6b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 2rem;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  display: none;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
    max-width: 95%;
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #10A37F;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    background: linear-gradient(135deg, #10A37F 0%, #0c8a6b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const LogoSubtext = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
`;

const FormTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #202123;
  text-align: center;
  margin-bottom: 0.75rem;
`;

const FormSubtitle = styled.p`
  font-size: 0.95rem;
  color: #6e6e80;
  text-align: center;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #202123;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #6e6e80;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f9f9fa;

  &:focus {
    outline: none;
    border-color: #10A37F;
    box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.15);
    background-color: white;
  }

  &::placeholder {
    color: #9fa1a6;
  }
`;

const PasswordToggle = styled.div`
  position: absolute;
  right: 12px;
  color: #6e6e80;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #202123;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #10A37F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);

  &:hover {
    background-color: #0c8a6b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #6e6e80;
  font-size: 0.875rem;

  &:before,
  &:after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: #e5e5e5;
  }

  span {
    padding: 0 1rem;
  }
`;

const SocialButton = styled.button<{ $bgColor: string }>`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.$bgColor};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.95;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  svg {
    margin-right: 0.5rem;
    font-size: 1.25rem;
  }
`;

const GoogleButton = styled(SocialButton)`
  background-color: white;
  color: #3c4043;
  border: 1px solid #e5e5e5;

  &:hover {
    background-color: #f9f9fa;
  }
`;

const SignupPrompt = styled.div`
  text-align: center;
  margin-top: 1.75rem;
  font-size: 0.875rem;
  color: #6e6e80;

  a {
    color: #10A37F;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.25rem;
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: #0c8a6b;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e34c4c;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: rgba(227, 76, 76, 0.1);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-right: 0.5rem;
  }
`;

const TestLoginInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #bde0fe;
  border-radius: 8px;
  font-size: 0.875rem;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TestLoginInfoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #0077b6;
  font-size: 0.95rem;
  font-weight: 600;
`;

const TestLoginInfoText = styled.p`
  margin: 0 0 0.25rem 0;
  color: #444;
`;

const BrandingContent = styled.div`
  max-width: 500px;
  text-align: center;
  animation: fadeIn 1s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BrandingTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BrandingText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  max-width: 90%;
`;

const BrandingFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 450px;
  margin-top: 1rem;
  text-align: left;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  svg {
    margin-right: 0.75rem;
    color: rgba(255, 255, 255, 0.9);
    flex-shrink: 0;
    margin-top: 3px;
  }
`;

const FeatureTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
`;

const BrandingBulletPoints = styled.ul`
  text-align: left;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  width: 100%;
  max-width: 450px;
`;

const BulletPoint = styled.li`
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 0.5rem;

  &::marker {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e5e5;
`;

const Tab = styled.div<{ $active: boolean }>`
  flex: 1;
  text-align: center;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  color: ${props => props.$active ? '#10A37F' : '#6e6e80'};
  border-bottom: ${props => props.$active ? '2px solid #10A37F' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.$active ? '#10A37F' : '#202123'};
  }
`;

const PasswordRequirements = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6e6e80;
`;

const RequirementItem = styled.div<{ $met: boolean }>`
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
  color: ${props => props.$met ? '#10A37F' : '#6e6e80'};

  svg {
    margin-right: 0.25rem;
  }
`;

const LanguageSelector = styled.div`
  margin-bottom: 1.25rem;
`;

const LanguageOption = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  gap: 1rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #202123;
  }
`;

const LoginPage: React.FC = () => {
  // Tabs state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPassword2, setRegisterPassword2] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ne'>('en');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPassword2, setShowRegisterPassword2] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMessage('Username and password are required');
      return;
    }

    setIsLoading(true);

    try {
      await login(loginUsername, loginPassword);
      navigate('/chat');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic validation
    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerPassword2.trim()) {
      setErrorMessage('All fields are required');
      return;
    }

    if (registerPassword !== registerPassword2) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (registerPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const userData: RegisterRequest = {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        confirm_password: registerPassword2,  // Updated from password2 to confirm_password
        preferred_language: preferredLanguage
      };

      await register(userData);
      navigate('/chat');
    } catch (error: any) {
      const errorMsg = error?.message || 'Registration failed. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Password requirements validation
  const passwordHasMinLength = registerPassword.length >= 8;
  const passwordHasLetter = /[a-zA-Z]/.test(registerPassword);
  const passwordHasNumber = /\d/.test(registerPassword);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(registerPassword);
  const passwordsMatch = registerPassword === registerPassword2 && registerPassword.length > 0;

  // Social login handlers (placeholder)
  const handleGoogleLogin = () => {
    alert('Google login functionality would be implemented here');
  };

  const handleFacebookLogin = () => {
    alert('Facebook login functionality would be implemented here');
  };

  return (
    <PageContainer>
      <ContentContainer>
        <LogoContainer>
          <Logo><span>NFRS Assistant</span></Logo>
          <LogoSubtext>Nepal Financial Reporting Standards</LogoSubtext>
        </LogoContainer>

        <FormCard>
          <TabsContainer>
            <Tab
              $active={activeTab === 'login'}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </Tab>
            <Tab
              $active={activeTab === 'register'}
              onClick={() => setActiveTab('register')}
            >
              Register
            </Tab>
          </TabsContainer>

          {activeTab === 'login' ? (
            <>
              <FormTitle>Sign in to your account</FormTitle>
              <FormSubtitle>Access NFRS standards and get intelligent assistance</FormSubtitle>

              <TestLoginInfo>
                <TestLoginInfoTitle>Test Credentials</TestLoginInfoTitle>
                <TestLoginInfoText>Username: <strong>martas</strong></TestLoginInfoText>
                <TestLoginInfoText>Password: <strong>martas@123</strong></TestLoginInfoText>
              </TestLoginInfo>

              <GoogleButton $bgColor="#ffffff" onClick={handleGoogleLogin}>
                <IconWrapper Icon={FcGoogle} size={20} /> Continue with Google
              </GoogleButton>

              <SocialButton $bgColor="#1877F2" onClick={handleFacebookLogin}>
                <IconWrapper Icon={FaFacebook} size={20} /> Continue with Facebook
              </SocialButton>

              <Divider><span>OR</span></Divider>

              <form onSubmit={handleLoginSubmit}>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <InputContainer>
                    <InputIcon>
                      <IconWrapper Icon={FiAtSign} size={18} />
                    </InputIcon>
                    <Input
                      id="username"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your username"
                      required
                    />
                  </InputContainer>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <InputContainer>
                    <InputIcon>
                      <IconWrapper Icon={FiLock} size={18} />
                    </InputIcon>
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your password"
                      required
                    />
                    <PasswordToggle onClick={() => setShowLoginPassword(!showLoginPassword)}>
                      <IconWrapper Icon={showLoginPassword ? FiEyeOff : FiEye} size={18} />
                    </PasswordToggle>
                  </InputContainer>
                </FormGroup>

                {errorMessage && (
                  <ErrorMessage>
                    {errorMessage}
                  </ErrorMessage>
                )}

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <SignupPrompt>
                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('register'); }}>Register now</a>
              </SignupPrompt>
            </>
          ) : (
            <>
              <FormTitle>Create a new account</FormTitle>
              <FormSubtitle>Join NFRS Assistant to get intelligent assistance on accounting standards</FormSubtitle>

              <form onSubmit={handleRegisterSubmit}>
                <FormGroup>
                  <Label htmlFor="register-username">Username</Label>
                  <InputContainer>
                    <InputIcon>
                      <IconWrapper Icon={FiAtSign} size={18} />
                    </InputIcon>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      disabled={isLoading}
                      placeholder="Choose a username"
                      required
                    />
                  </InputContainer>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="register-email">Email</Label>
                  <InputContainer>
                    <InputIcon>
                      <IconWrapper Icon={FiMail} size={18} />
                    </InputIcon>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your email"
                      required
                    />
                  </InputContainer>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="register-password">Password</Label>
                  <InputContainer>
                    <InputIcon>
                      <IconWrapper Icon={FiLock} size={18} />
                    </InputIcon>
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Create a password"
                      required
                    />
                    <PasswordToggle onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                      <IconWrapper Icon={showRegisterPassword ? FiEyeOff : FiEye} size={18} />
                    </PasswordToggle>
                  </InputContainer>

                  <PasswordRequirements>
                    <RequirementItem $met={passwordHasMinLength}>
                      <IconWrapper Icon={FiCheck} size={14} /> At least 8 characters
                    </RequirementItem>
                    <RequirementItem $met={passwordHasLetter}>
                      <IconWrapper Icon={FiCheck} size={14} /> At least one letter
                    </RequirementItem>
                    <RequirementItem $met={passwordHasNumber}>
                      <IconWrapper Icon={FiCheck} size={14} /> At least one number
                    </RequirementItem>
                    <RequirementItem $met={passwordHasSpecial}>
                      <IconWrapper Icon={FiCheck} size={14} /> At least one special character
                    </RequirementItem>
                  </PasswordRequirements>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="register-password2">Confirm Password</Label>
                  <InputContainer>
                    <InputIcon>
                      <IconWrapper Icon={FiLock} size={18} />
                    </InputIcon>
                    <Input
                      id="register-password2"
                      type={showRegisterPassword2 ? "text" : "password"}
                      value={registerPassword2}
                      onChange={(e) => setRegisterPassword2(e.target.value)}
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      required
                    />
                    <PasswordToggle onClick={() => setShowRegisterPassword2(!showRegisterPassword2)}>
                      <IconWrapper Icon={showRegisterPassword2 ? FiEyeOff : FiEye} size={18} />
                    </PasswordToggle>
                  </InputContainer>

                  {registerPassword2 && (
                    <RequirementItem $met={passwordsMatch} style={{ marginTop: '0.5rem' }}>
                      <IconWrapper Icon={FiCheck} size={14} /> Passwords match
                    </RequirementItem>
                  )}
                </FormGroup>

                <LanguageSelector>
                  <Label>Preferred Language</Label>
                  <LanguageOption>
                    <label>
                      <input
                        type="radio"
                        name="language"
                        value="en"
                        checked={preferredLanguage === 'en'}
                        onChange={() => setPreferredLanguage('en')}
                      />
                      English
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="language"
                        value="ne"
                        checked={preferredLanguage === 'ne'}
                        onChange={() => setPreferredLanguage('ne')}
                      />
                      नेपाली
                    </label>
                  </LanguageOption>
                </LanguageSelector>

                {errorMessage && (
                  <ErrorMessage>
                    {errorMessage}
                  </ErrorMessage>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !passwordHasMinLength || !passwordHasLetter || !passwordHasNumber || !passwordsMatch}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <SignupPrompt>
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Sign in</a>
              </SignupPrompt>
            </>
          )}
        </FormCard>
      </ContentContainer>

      <BrandingContainer>
        <BrandingContent>
          <BrandingTitle>NFRS Assistant</BrandingTitle>
          <BrandingText>
            Your intelligent companion for navigating Nepal Financial Reporting Standards.
            Get accurate information, explanations, and guidance on all NFRS requirements
            with our AI-powered platform designed for accounting professionals.
          </BrandingText>

          <BrandingFeatures>
            <FeatureItem>
              <IconWrapper Icon={FiBook} size={22} />
              <div>
                <FeatureTitle>Complete NFRS Coverage</FeatureTitle>
                <FeatureDescription>Access detailed information on all Nepal Financial Reporting Standards with examples and case studies.</FeatureDescription>
              </div>
            </FeatureItem>
            <FeatureItem>
              <IconWrapper Icon={FiHelpCircle} size={22} />
              <div>
                <FeatureTitle>Expert AI Assistance</FeatureTitle>
                <FeatureDescription>Get immediate answers to your accounting queries using our advanced AI trained on NFRS materials.</FeatureDescription>
              </div>
            </FeatureItem>
            <FeatureItem>
              <IconWrapper Icon={FiFileText} size={22} />
              <div>
                <FeatureTitle>Implementation Guidance</FeatureTitle>
                <FeatureDescription>Learn how to apply NFRS principles in practical situations with detailed implementation guides.</FeatureDescription>
              </div>
            </FeatureItem>
          </BrandingFeatures>
        </BrandingContent>
      </BrandingContainer>
    </PageContainer>
  );
};

export default LoginPage;