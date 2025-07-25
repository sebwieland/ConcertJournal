// SignUpSide.tsx
import * as React from 'react';
import SignUpCard from './sign-up';
import Content from './Content';
import DefaultLayout from "../../theme/DefaultLayout";

export default function SignUpSide() {
    return (
        <DefaultLayout>
            <Content/>
            <SignUpCard/>
        </DefaultLayout>
    );
}