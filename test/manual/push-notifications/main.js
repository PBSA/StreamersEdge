function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}


const triggerPush = document.querySelector('.trigger-push');

async function triggerPushNotification() {
  // console.log('login...');
  // const userA = await fetch('http://localhost:3000/api/v1/auth/sign-up', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     'username': 'qqqqq',
  //     'email': 'a.pazniak@pixelplex.io',
  //     'password': 'qweasd',
  //     'repeatPassword': 'qweasd'
  //   })
  // });
  //
  // const content = await userA.json();
  // console.log(content);
  // if (!publicVapidKey) {
  //
  // }

  // const userSingIn = await fetch('http://localhost:3000/api/v1/auth/sign-in', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     'login': 'a.pazniak@pixelplex.io',
  //     'password': 'qweasd'
  //   })
  // });
  // const test = await userSingIn.json();
  // console.log(test);

  if ('serviceWorker' in navigator) {
    console.log('Test here');

    const register1 = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    const result = await fetch('http://localhost:3000/api/v1/challenges/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await result.json();
    const publicKey = data.result;

    register1.pushManager.getSubscription().then(function(subscription) {
      subscription.unsubscribe().then(function(successful) {
        console.log(successful);
      }).catch(function(e) {
        console.log(e);
      });
    });

    console.log('first key');
    console.log(data.result);

    const register = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    console.log('subscription');
    console.log(subscription);

    const req = await fetch('http://localhost:3000/api/v1/challenges/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const answer = await req.json();
    console.log('second key');
    console.log(answer.result);

  } else {
    console.error('Service workers are not supported in this browser');
  }

}

triggerPush.addEventListener('click', () => {
  triggerPushNotification().catch((error) => console.error(error));
});


async function sendFormData() {
  const body = ['login', 'password'].reduce((a, field) => ({...a, [field]: document.getElementById(field).value}), {});
  console.log(body);
  await fetch('http://localhost:3000/api/v1/auth/sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

document.getElementById('btn').addEventListener('click', async () => {
  await sendFormData();
});
