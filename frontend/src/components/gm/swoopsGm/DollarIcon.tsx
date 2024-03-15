interface IProps {
    color: string;
    height?: number | string;
    width?: number | string;
}

const DollarIcon = (props: IProps): JSX.Element => {
    const { color } = props;
    const height = props.height || '24';
    const width = props.width || '24';

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 24 24">
            <path
                fill={color}
                d="M10.12 8.902c.186-.124.415-.235.68-.32v2.037a2.768 2.768 0 01-.68-.32c-.437-.291-.52-.562-.52-.699 0-.136.083-.407.52-.698zM13.2 15.42v-2.038c.265.085.494.196.68.32.437.291.52.562.52.698 0 .137-.083.408-.52.699a2.769 2.769 0 01-.68.32z"
            ></path>
            <path
                fill={color}
                fillRule="evenodd"
                d="M12 21.6a9.6 9.6 0 009.6-9.6 9.6 9.6 0 10-9.6 9.6zM13.2 6a1.2 1.2 0 10-2.4 0v.11c-.746.14-1.436.411-2.011.795C7.923 7.482 7.2 8.412 7.2 9.6c0 1.19.723 2.119 1.589 2.696a5.442 5.442 0 002.011.794v2.33c-.47-.153-.817-.381-1.012-.606a1.2 1.2 0 00-1.813 1.573c.675.778 1.696 1.29 2.825 1.503V18a1.2 1.2 0 002.4 0v-.11a5.442 5.442 0 002.011-.794c.866-.577 1.589-1.507 1.589-2.696 0-1.188-.723-2.118-1.589-2.695a5.442 5.442 0 00-2.011-.794V8.58c.47.153.817.381 1.012.606a1.2 1.2 0 001.813-1.573c-.675-.778-1.696-1.29-2.825-1.503v-.11z"
                clipRule="evenodd"
            ></path>
        </svg>
    );
};

export default DollarIcon;
