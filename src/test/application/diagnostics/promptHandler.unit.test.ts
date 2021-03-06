// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

// tslint:disable:insecure-random max-func-body-length

import * as typemoq from 'typemoq';
import { DiagnosticSeverity } from 'vscode';
import { DiagnosticCommandPromptHandlerService, MessageCommandPrompt } from '../../../client/application/diagnostics/promptHandler';
import { DiagnosticScope, IDiagnostic, IDiagnosticCommand, IDiagnosticHandlerService } from '../../../client/application/diagnostics/types';
import { IApplicationShell } from '../../../client/common/application/types';
import { EnumEx } from '../../../client/common/enumUtils';
import { IServiceContainer } from '../../../client/ioc/types';

suite('Application Diagnostics - PromptHandler', () => {
    let serviceContainer: typemoq.IMock<IServiceContainer>;
    let appShell: typemoq.IMock<IApplicationShell>;
    let promptHandler: IDiagnosticHandlerService<MessageCommandPrompt>;

    setup(() => {
        serviceContainer = typemoq.Mock.ofType<IServiceContainer>();
        appShell = typemoq.Mock.ofType<IApplicationShell>();

        serviceContainer.setup(s => s.get(typemoq.It.isValue(IApplicationShell)))
            .returns(() => appShell.object);

        promptHandler = new DiagnosticCommandPromptHandlerService(serviceContainer.object);
    });

    EnumEx.getNamesAndValues<DiagnosticSeverity>(DiagnosticSeverity).forEach(severity => {
        test(`Handling a diagnositic of severity '${severity.name}' should display a message without any buttons`, async () => {
            const diagnostic: IDiagnostic = { code: '1', message: 'one', scope: DiagnosticScope.Global, severity: severity.value };
            switch (severity.value) {
                case DiagnosticSeverity.Error: {
                    appShell.setup(a => a.showErrorMessage(typemoq.It.isValue(diagnostic.message)))
                        .verifiable(typemoq.Times.once());
                    break;
                }
                case DiagnosticSeverity.Warning: {
                    appShell.setup(a => a.showWarningMessage(typemoq.It.isValue(diagnostic.message)))
                        .verifiable(typemoq.Times.once());
                    break;
                }
                default: {
                    appShell.setup(a => a.showInformationMessage(typemoq.It.isValue(diagnostic.message)))
                        .verifiable(typemoq.Times.once());
                    break;
                }
            }

            await promptHandler.handle(diagnostic);
            appShell.verifyAll();
        });
        test(`Handling a diagnositic of severity '${severity.name}' should display a custom message with buttons`, async () => {
            const diagnostic: IDiagnostic = { code: '1', message: 'one', scope: DiagnosticScope.Global, severity: severity.value };
            const options: MessageCommandPrompt = {
                commandPrompts: [
                    { prompt: 'Yes' },
                    { prompt: 'No' }
                ],
                message: 'Custom Message'
            };

            switch (severity.value) {
                case DiagnosticSeverity.Error: {
                    appShell.setup(a => a.showErrorMessage(typemoq.It.isValue(options.message!),
                        typemoq.It.isValue('Yes'), typemoq.It.isValue('No')))
                        .verifiable(typemoq.Times.once());
                    break;
                }
                case DiagnosticSeverity.Warning: {
                    appShell.setup(a => a.showWarningMessage(typemoq.It.isValue(options.message!),
                        typemoq.It.isValue('Yes'), typemoq.It.isValue('No')))
                        .verifiable(typemoq.Times.once());
                    break;
                }
                default: {
                    appShell.setup(a => a.showInformationMessage(typemoq.It.isValue(options.message!),
                        typemoq.It.isValue('Yes'), typemoq.It.isValue('No')))
                        .verifiable(typemoq.Times.once());
                    break;
                }
            }

            await promptHandler.handle(diagnostic, options);
            appShell.verifyAll();
        });
        test(`Handling a diagnositic of severity '${severity.name}' should display a custom message with buttons and invoke selected command`, async () => {
            const diagnostic: IDiagnostic = { code: '1', message: 'one', scope: DiagnosticScope.Global, severity: severity.value };
            const command = typemoq.Mock.ofType<IDiagnosticCommand>();
            const options: MessageCommandPrompt = {
                commandPrompts: [
                    { prompt: 'Yes', command: command.object },
                    { prompt: 'No', command: command.object }
                ],
                message: 'Custom Message'
            };
            command.setup(c => c.invoke())
                .verifiable(typemoq.Times.once());

            switch (severity.value) {
                case DiagnosticSeverity.Error: {
                    appShell.setup(a => a.showErrorMessage(typemoq.It.isValue(options.message!),
                        typemoq.It.isValue('Yes'), typemoq.It.isValue('No')))
                        .returns(() => Promise.resolve('Yes'))
                        .verifiable(typemoq.Times.once());
                    break;
                }
                case DiagnosticSeverity.Warning: {
                    appShell.setup(a => a.showWarningMessage(typemoq.It.isValue(options.message!),
                        typemoq.It.isValue('Yes'), typemoq.It.isValue('No')))
                        .returns(() => Promise.resolve('Yes'))
                        .verifiable(typemoq.Times.once());
                    break;
                }
                default: {
                    appShell.setup(a => a.showInformationMessage(typemoq.It.isValue(options.message!),
                        typemoq.It.isValue('Yes'), typemoq.It.isValue('No')))
                        .returns(() => Promise.resolve('Yes'))
                        .verifiable(typemoq.Times.once());
                    break;
                }
            }

            await promptHandler.handle(diagnostic, options);
            appShell.verifyAll();
            command.verifyAll();
        });
    });
});
