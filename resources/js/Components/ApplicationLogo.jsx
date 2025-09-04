export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/images/roasttimer.jpeg"
            alt="Roast Timer"
            style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%'
            }}
        />
    );
}
