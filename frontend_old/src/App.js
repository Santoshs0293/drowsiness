import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import VideoCall from './components/VideoCall';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/videocall" element={<VideoCall />} />
                </Switch>
            </Router>
        </AuthProvider>
    );
}

export default App;
