import './App.css';
import React, { useState } from 'react';
import * as firebase from "firebase/app"
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FacebookAuthProvider } from "firebase/auth";


// bootstrap:
import { Card, Container } from 'react-bootstrap';

firebase.initializeApp(firebaseConfig);



function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    Name: '',
    UserEmail: '',
    Photo: '',
  });

  //  ssdd
  const provider = new GoogleAuthProvider();

  const HandleSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignedIn: true,
          Name: displayName,
          UserEmail: email,
          Photo: photoURL,
        }
        setUser(signedInUser);
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        console.log(errorCode, errorMessage, email, credential);
      });
  }

  const HandleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      const signedOutUser = {
        isSignedIn: false,
        Name: '',
        UserEmail: '',
        Photo: '',
        error: '',
        success: false,
      }
      setUser(signedOutUser);
    }).catch((error) => {
      console.log(error)
    });
  }

  const FBProvider = new FacebookAuthProvider();

  const HandleFbSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, FBProvider)
      .then((result) => {
        const user = result.user;
        console.log('fb user after signIn', user)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const HandleBlur = (e) => {
    let isFormValid = true;
    if (e.target.name === "email") {
      isFormValid = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e.target.value.toLowerCase());
    }
    if (e.target.name === 'password') {
      const isPasswordValid = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})").test(e.target.value);
      isFormValid = isPasswordValid;
    }
    if (isFormValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const HandleSubmitClicked = (e) => {
    if (newUser && user.email && user.password) {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserProfile(user.name)
        })
        .catch((err) => {
          const newUserInfo = { ...user };
          newUserInfo.error = err.code;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in user info", res.user)
        })
        .catch((err) => {
          const newUserInfo = { ...user };
          newUserInfo.error = err.code;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }

  const updateUserProfile = (name) => {
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      console.log("user name updated successfully", name)
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className="App" >
      {
        user.isSignedIn ? <button onClick={HandleSignOut} > Sign Out</button> : <button onClick={HandleSignIn}>sign in</button>
      }
      {
        user.isSignedIn && <div>
          <h2>welcome, {user.Name}</h2>
          <h3> Email: {user.UserEmail}</h3>
          <img src={user.Photo} alt="" />
        </div>
      }


      {/* own signIn method: */}


      <Container>
        {/* facebook signIn method: */}
        <button onClick={HandleFbSignIn}> Sign In With Facebook</button>
        <br />


        <Card>
          <Card.Body>
            {
              user.isSignedIn ? <h2>Sign Out to test again!</h2> : <h2>Sign in with Email</h2>
            }
            <input onChange={() => setNewUser(!newUser)} type="checkbox" />
            <label htmlFor="newUser">New User Sign Up</label>
            <form onSubmit={HandleSubmitClicked}>
              {
                newUser && <input onBlur={HandleBlur} type="text" name="name" placeholder="name" id="0" />
              }
              <br />
              <input type="email" onBlur={HandleBlur} name="email" required id="1" placeholder="Email" />
              <br />
              <input type="password" onBlur={HandleBlur} name="password" required id="2" placeholder="pass" />
              <br />
              <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
            </form>
            <h2 style={{ color: 'red' }}> {user.error} </h2>
            {
              user.success && <h2 style={{ color: 'green' }}> User {newUser ? 'Created' : "Signed In"} Successfully! </h2>
            }
          </Card.Body>
        </Card>
      </Container>

    </div>
  );
}

export default App;
