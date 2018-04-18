import React from 'react';
import less from './index.less';
import scss from './index.scss';
import stylus from './index.styl';


export default class extends React.Component {
    // static async getInitialProps({ req }) {
    //     const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
    //     return { userAgent };
    // }

    render() {
        return (
            <div>
                <head>
                    <link rel="stylesheet" href="/_next/static/style.css"/>
                </head>
                <div className={[less.example, scss.example, stylus.example, 'aaa'].join(' ')}>
                    Hello World! {this.props.userAgent}
                </div>
                <style jsx>{`
                    .aaa {
                        background-color: #f5f5f5;
                    }`
                }</style>
            </div>
        );
    }
}
