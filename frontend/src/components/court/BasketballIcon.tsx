import React from 'react';

interface IProps {
    color: string;
}

function BasketballIcon(props: IProps) {
    const { color } = props;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 48 48">
            <path
                fill={color}
                fillRule="evenodd"
                d="M24 46c12.15 0 22-9.85 22-22S36.15 2 24 2 2 11.85 2 24s9.85 22 22 22zm12.379-6.29a19.99 19.99 0 007.299-12.114c-3.13-2.941-8.57-5.718-13.883-7.195-2.822-.785-5.538-1.181-7.783-1.066-1.802.092-3.183.506-4.107 1.198 4.592 6.753 10.939 13.983 18.474 19.177zm-1.736 1.226c-7.337-5.2-13.53-12.216-18.1-18.85-3.142 4.381-3.294 8.75-2.204 12.498 1.151 3.96 3.699 7.239 5.653 9.014 1.295.264 2.635.402 4.008.402 3.911 0 7.56-1.123 10.643-3.064zM16.798 18.863c1.364-.982 3.175-1.427 5.112-1.526 2.53-.13 5.471.317 8.42 1.137 4.955 1.377 10.134 3.867 13.635 6.72A19.935 19.935 0 0038.28 9.997c-10.182-.134-17.545 2.883-22.701 6.917.388.642.795 1.292 1.22 1.95zm-2.769-.65c.424.696.869 1.4 1.333 2.11-3.966 5.128-4.234 10.381-2.944 14.82.826 2.838 2.284 5.34 3.798 7.286a20.07 20.07 0 01-10.643-10.64c.89-3.713 3.465-9.09 8.456-13.575zm.527-3.039c5.066-3.9 12.068-6.854 21.47-7.156A19.911 19.911 0 0024 4c-.742 0-1.475.04-2.196.12-2.124 3.984-5.182 7.02-8.249 9.236.315.594.649 1.2 1.001 1.818zm-1.566 1.288c-4.346 3.813-7.047 8.29-8.48 12.045A20.062 20.062 0 014 24c0-2.18.35-4.28.994-6.245 1.793-.558 4.286-1.621 6.896-3.272.346.646.712 1.307 1.1 1.98zm-1.7-7.905a19.936 19.936 0 017.94-3.984c-1.829 2.903-4.2 5.209-6.596 6.979a47.103 47.103 0 01-1.344-2.995zM9.722 9.995c.363.854.78 1.758 1.248 2.703A29.979 29.979 0 016 15.274a20.049 20.049 0 013.723-5.279z"
                clipRule="evenodd"
            ></path>
        </svg>
    );
}

export default BasketballIcon;
