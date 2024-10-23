import '../../App.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);


    try {
      const response = await axios.post('http://localhost:7878/users/sign', {
        email,
        password
      });
      console.log('로그인 성공', response.data);
      navigate('/home');

    } catch (err) {
      setError(err.response?.data?.message);
      console.log('Error', err);
    }
  }

  return (
    <div className='login'>
      <div>
        <h1>
          Login
        </h1>
      </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3 optional" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="로그인 유지" size='s' />
          <div id='find-pwd'>비밀번호 찾기</div>
        </Form.Group>
        {error && <p className='error-message'>{error}</p>}
        <div className="d-grid gap-2">
          <Button className='rounded' variant="dark" type="submit">
            로그인
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default Login;
