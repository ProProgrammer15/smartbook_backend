import React from 'react'
import {Link} from 'react-router-dom';
import { Button, Container, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function NavbarComponent({user}) {
  const parsedUser = user ? JSON.parse(user) : null;
  const navigator = useNavigate('')

  const logoutUser = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigator('/login')
    window.location.reload();
  }

  return (
    <Navbar expand="lg" style={{backgroundColor: "rgb(0, 0, 0)"}}>
      <Container fluid>
        <Navbar.Brand href="/" className='text-white' style={{marginLeft: "5px"}}>Book Recommendation</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          {parsedUser?.name ? (
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            <Link className="nav-link text-white" to="courses/">Courses</Link>
            <Link className="nav-link text-white" to="recommendations/">Recommendations</Link>
          </Nav>
          ): (<></>)}
          <div className="d-flex align-items-center">
            {parsedUser?.name ? (
              <div className="d-flex align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center">
                    <FaUserCircle size={24} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ marginLeft: '-90px' }}>
                    <Dropdown.Item as={Link} to="/profile/">View Profile</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/login" onClick={logoutUser}>Log Out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <span className="me-2">{parsedUser?.user}</span>
              </div>
            ) : (
              <div className="d-flex">
                <Link to="/login">
                <Button variant="outline-success" className="me-2">Login</Button>
                </Link>
                <Link to="/signup">
                <Button variant="outline-primary">Signup</Button>
                </Link>
              </div>
            )}
            </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;