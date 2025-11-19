const func = async () => {
    const result = await window.electron.fetchUrl('https://google.com');
    console.log(result?.data);
}

func();