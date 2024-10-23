import '../../App.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function Join() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickName] = useState(0);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:7878/users/sign', {
                name,
                email,
                password,
                nickname
        });

        console.log('회원가입 성공', response.data);
        alert('회원가입 성공');
        navigate('/home');

        } catch (err) {
            setError(err.response?.data?.message || '회원가입 실패');
            console.log('회원가입 실패', err);
        }       
    };

    return (
        <div className='join'>
            <h1>
                Join
            </h1>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Control
                        type="text"
                        placeholder="name"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control
                        type="email"
                        placeholder="email"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Control
                        type="password"
                        placeholder="password"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicNickName">
                    <Form.Control
                        type="text"
                        placeholder="nickname"
                    />
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button className='rounded' variant="primary" type="submit">
                        회원가입
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Join;
